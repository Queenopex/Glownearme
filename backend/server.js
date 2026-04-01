import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'node:url';
import { fileURLToPath } from 'node:url';
import { readStore, writeStore } from './lib/store.js';

const PORT = Number(process.env.PORT || 4000);
let store = await readStore();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PORTFOLIO_UPLOADS_DIR = path.join(UPLOADS_DIR, 'portfolio');

await mkdir(PORTFOLIO_UPLOADS_DIR, { recursive: true });

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload, null, 2));
}

function notFound(response) {
  sendJson(response, 404, { error: 'Route not found' });
}

function sendBinary(response, statusCode, contentType, payload) {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
  });
  response.end(payload);
}

function publicUser(user) {
  return {
    id: user.id,
    role: user.role,
    artistId: user.artistId,
    name: user.name,
    email: user.email,
    location: user.location,
  };
}

async function persistStore() {
  await writeStore(store);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Payload too large'));
    });

    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    request.on('error', reject);
  });
}

function buildBookingView(booking) {
  const artist = store.artists.find((item) => item.id === booking.artistId);
  return { ...booking, artist };
}

function computeBookingAmounts(artist, quotedAmount) {
  const serviceAmount = Number(quotedAmount ?? artist.pricePerSession);
  const bookingFee = Math.round(serviceAmount * 0.05);
  return {
    serviceAmount,
    bookingFee,
    totalAmount: serviceAmount + bookingFee,
  };
}

function nextBookingStatus(action, booking) {
  if (action === 'accept') {
    return {
      status: 'accepted',
      paymentStatus: 'captured',
      refundAmount: 0,
      rematchEligible: false,
    };
  }

  if (action === 'decline') {
    return {
      status: 'declined',
      paymentStatus: booking.paymentStatus === 'captured' ? 'refunded' : 'voided',
      refundAmount: booking.totalAmount ?? 0,
      rematchEligible: true,
    };
  }

  if (action === 'cancel_by_artist') {
    return {
      status: 'cancelled_by_artist',
      paymentStatus: 'refunded',
      refundAmount: booking.totalAmount ?? 0,
      rematchEligible: true,
    };
  }

  throw new Error('Unsupported booking action');
}

function sanitizeFileName(value) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  throw new Error('Unsupported image format');
}

async function savePortfolioUpload(artistId, file) {
  if (!file || typeof file.dataUrl !== 'string' || typeof file.name !== 'string') {
    throw new Error('Each uploaded file needs a name and dataUrl');
  }

  const match = file.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Invalid image payload');
  }

  const [, mimeType, base64Payload] = match;
  const extension = extensionFromMimeType(mimeType);
  const safeBaseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, '')) || 'portfolio-look';
  const fileName = `${artistId}-${Date.now()}-${safeBaseName}.${extension}`;
  const absolutePath = path.join(PORTFOLIO_UPLOADS_DIR, fileName);

  await writeFile(absolutePath, Buffer.from(base64Payload, 'base64'));

  return {
    id: `portfolio-${Date.now()}-${safeBaseName}`,
    url: `/uploads/portfolio/${fileName}`,
    caption: safeBaseName.replace(/-/g, ' '),
    style: 'Signature',
  };
}

function contentTypeForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    notFound(response);
    return;
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  const parsedUrl = parse(request.url, true);
  const { pathname, query } = parsedUrl;

  try {
    if (request.method === 'GET' && pathname?.startsWith('/uploads/')) {
      const relativePath = pathname.replace('/uploads/', '');
      const absolutePath = path.join(UPLOADS_DIR, relativePath);

      if (!absolutePath.startsWith(UPLOADS_DIR)) {
        sendJson(response, 400, { error: 'Invalid upload path' });
        return;
      }

      try {
        const asset = await readFile(absolutePath);
        sendBinary(response, 200, contentTypeForFile(absolutePath), asset);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          sendJson(response, 404, { error: 'Uploaded file not found' });
          return;
        }

        throw error;
      }
      return;
    }

    if (request.method === 'GET' && pathname === '/health') {
      sendJson(response, 200, {
        status: 'ok',
        service: 'glownearme-backend',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (request.method === 'POST' && pathname === '/auth/login') {
      const body = await readBody(request);
      const role = body.role;
      const email = typeof body.email === 'string' ? body.email.toLowerCase() : '';
      const password = body.password;

      const user = store.users.find(
        (item) => item.role === role && item.email.toLowerCase() === email && item.password === password,
      );

      if (!user) {
        sendJson(response, 401, { error: 'Invalid email, password, or role' });
        return;
      }

      sendJson(response, 200, {
        message: 'Login successful',
        data: publicUser(user),
      });
      return;
    }

    if (request.method === 'GET' && pathname === '/artists') {
      const area = typeof query.area === 'string' ? query.area : null;
      const search = typeof query.search === 'string' ? query.search.toLowerCase() : null;

      const filtered = store.artists.filter((artist) => {
        const areaMatches = area ? artist.area === area : true;
        const searchMatches = search
          ? artist.name.toLowerCase().includes(search) ||
            artist.location.toLowerCase().includes(search) ||
            artist.specialty.toLowerCase().includes(search)
          : true;

        return areaMatches && searchMatches;
      });

      sendJson(response, 200, { data: filtered, total: filtered.length });
      return;
    }

    if (request.method === 'GET' && pathname?.startsWith('/artists/')) {
      const artistId = pathname.split('/')[2];
      const artist = store.artists.find((item) => item.id === artistId);

      if (!artist) {
        sendJson(response, 404, { error: 'Artist not found' });
        return;
      }

      sendJson(response, 200, { data: artist });
      return;
    }

    if (request.method === 'PUT' && pathname?.startsWith('/artists/')) {
      const artistId = pathname.split('/')[2];
      const artistIndex = store.artists.findIndex((item) => item.id === artistId);

      if (artistIndex === -1) {
        sendJson(response, 404, { error: 'Artist not found' });
        return;
      }

      const body = await readBody(request);
      const currentArtist = store.artists[artistIndex];

      store.artists[artistIndex] = {
        ...currentArtist,
        ...body,
        id: currentArtist.id,
      };

      await persistStore();
      sendJson(response, 200, {
        message: 'Artist profile updated',
        data: store.artists[artistIndex],
      });
      return;
    }

    if (request.method === 'POST' && pathname === '/uploads/portfolio') {
      const body = await readBody(request);
      const artistId = typeof body.artistId === 'string' ? body.artistId : '';
      const files = Array.isArray(body.files) ? body.files : [];

      if (!artistId || !store.artists.find((artist) => artist.id === artistId)) {
        sendJson(response, 400, { error: 'A valid artistId is required' });
        return;
      }

      if (!files.length) {
        sendJson(response, 400, { error: 'At least one file is required' });
        return;
      }

      const uploadedFiles = await Promise.all(files.map((file) => savePortfolioUpload(artistId, file)));
      sendJson(response, 201, {
        message: 'Portfolio files uploaded',
        data: uploadedFiles,
      });
      return;
    }

    if (request.method === 'GET' && pathname === '/bookings') {
      sendJson(response, 200, {
        data: store.bookings.map(buildBookingView),
        total: store.bookings.length,
      });
      return;
    }

    if (request.method === 'GET' && pathname === '/requests') {
      const artistId = typeof query.artistId === 'string' ? query.artistId : null;
      const requests = artistId
        ? store.requests.filter((requestItem) => requestItem.artistId === artistId)
        : store.requests;

      sendJson(response, 200, {
        data: requests,
        total: requests.length,
      });
      return;
    }

    if (request.method === 'POST' && pathname === '/bookings') {
      const body = await readBody(request);
      const artist = store.artists.find((item) => item.id === body.artistId);

      if (!artist || !body.clientName || !body.service || !body.date || !body.time) {
        sendJson(response, 400, {
          error: 'artistId, clientName, service, date, and time are required',
        });
        return;
      }

      const amountSummary = computeBookingAmounts(artist, body.quotedAmount);
      const booking = {
        id: `b${store.bookings.length + 1}`,
        artistId: body.artistId,
        clientId: body.clientId || 'client-1',
        clientName: body.clientName,
        service: body.service,
        date: body.date,
        time: body.time,
        status: 'pending_artist_response',
        paymentStatus: 'authorized',
        location: body.location || artist.location,
        notes: body.notes || '',
        ...amountSummary,
        refundAmount: 0,
        rematchEligible: false,
        priceProtectionLimit: 10000,
        timeline: [
          {
            type: 'request_created',
            at: new Date().toISOString(),
            note: 'Client submitted booking request and payment was placed on hold.',
          },
        ],
      };

      store.bookings.unshift(booking);
      await persistStore();
      sendJson(response, 201, { message: 'Booking created', data: buildBookingView(booking) });
      return;
    }

    if (request.method === 'PATCH' && pathname?.startsWith('/bookings/')) {
      const bookingId = pathname.split('/')[2];
      const bookingIndex = store.bookings.findIndex((item) => item.id === bookingId);

      if (bookingIndex === -1) {
        sendJson(response, 404, { error: 'Booking not found' });
        return;
      }

      const body = await readBody(request);
      const action = body.action;
      const booking = store.bookings[bookingIndex];

      if (!['accept', 'decline', 'cancel_by_artist'].includes(action)) {
        sendJson(response, 400, { error: 'action must be accept, decline, or cancel_by_artist' });
        return;
      }

      const transition = nextBookingStatus(action, booking);
      const note =
        action === 'accept'
          ? 'Artist accepted the booking and payment was captured.'
          : action === 'decline'
            ? 'Artist declined the booking. Payment hold released and rematch opened.'
            : 'Artist cancelled after acceptance. Client refund and rematch protection triggered.';

      store.bookings[bookingIndex] = {
        ...booking,
        ...transition,
        timeline: [
          ...(booking.timeline ?? []),
          {
            type: action,
            at: new Date().toISOString(),
            note,
          },
        ],
      };

      await persistStore();
      sendJson(response, 200, {
        message: 'Booking updated',
        data: buildBookingView(store.bookings[bookingIndex]),
      });
      return;
    }

    if (request.method === 'GET' && pathname === '/saved-artists') {
      const clientId = typeof query.clientId === 'string' ? query.clientId : 'client-1';
      const artistIds = store.savedArtists
        .filter((item) => item.clientId === clientId)
        .map((item) => item.artistId);
      const data = store.artists.filter((artist) => artistIds.includes(artist.id));

      sendJson(response, 200, { data, total: data.length });
      return;
    }

    if (request.method === 'POST' && pathname === '/saved-artists') {
      const body = await readBody(request);
      const clientId = body.clientId || 'client-1';
      const artistId = body.artistId;

      if (!artistId || !store.artists.find((artist) => artist.id === artistId)) {
        sendJson(response, 400, { error: 'A valid artistId is required' });
        return;
      }

      const existing = store.savedArtists.find(
        (item) => item.clientId === clientId && item.artistId === artistId,
      );

      if (!existing) {
        store.savedArtists.push({ clientId, artistId });
        await persistStore();
      }

      sendJson(response, 201, { message: 'Artist saved', data: { clientId, artistId } });
      return;
    }

    if (request.method === 'DELETE' && pathname === '/saved-artists') {
      const body = await readBody(request);
      const clientId = body.clientId || 'client-1';
      const artistId = body.artistId;
      const targetIndex = store.savedArtists.findIndex(
        (item) => item.clientId === clientId && item.artistId === artistId,
      );

      if (targetIndex === -1) {
        sendJson(response, 404, { error: 'Saved artist not found' });
        return;
      }

      store.savedArtists.splice(targetIndex, 1);
      await persistStore();
      sendJson(response, 200, { message: 'Saved artist removed', data: { clientId, artistId } });
      return;
    }

    if (request.method === 'GET' && pathname === '/conversations') {
      sendJson(response, 200, { data: store.conversations, total: store.conversations.length });
      return;
    }

    if (request.method === 'POST' && pathname === '/messages') {
      const body = await readBody(request);
      let conversation = store.conversations.find((item) => item.id === body.conversationId);

      if (!conversation && body.artistId) {
        const artist = store.artists.find((item) => item.id === body.artistId);

        if (!artist) {
          sendJson(response, 400, { error: 'A valid artistId is required to create a conversation' });
          return;
        }

        conversation = {
          id: `c${store.conversations.length + 1}`,
          artistId: artist.id,
          artistName: artist.name,
          messages: [],
        };
        store.conversations.push(conversation);
      }

      if (!conversation || !body.sender || !body.text) {
        sendJson(response, 400, {
          error: 'conversationId or artistId, sender, and text are required',
        });
        return;
      }

      const message = {
        id: `m${conversation.messages.length + 1}`,
        sender: body.sender,
        text: body.text,
        sentAt: new Date().toISOString(),
      };

      conversation.messages.push(message);
      await persistStore();
      sendJson(response, 201, { message: 'Message sent', data: message });
      return;
    }

    notFound(response);
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`GlowNearMe backend running at http://localhost:${PORT}`);
});
