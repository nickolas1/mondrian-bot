const Twitter = require('twitter');
const fs = require('fs');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const tweetImage = async (path, title) => {
  const mediaType = 'image/jpeg';
  const mediaData = fs.readFileSync(path);
  const mediaSize = fs.statSync(path).size;
  const mediaId = await initUpload(mediaSize, mediaType);
  try {
    await appendUpload(mediaId, mediaData);
    await finalizeUpload(mediaId);
    await tweetIt(mediaId, title);
    console.log('Image tweeted!');
  } catch (e) {
    console.log(e);
  }
};

const initUpload = async (size, type) => {
  const data = await makePost('media/upload', {
    command: 'INIT',
    total_bytes: size,
    media_type: type
  });
  return data.media_id_string;
};

const appendUpload = (mediaId, data) => {
  return makePost('media/upload', {
    command: 'APPEND',
    media_id: mediaId,
    media: data,
    segment_index: 0
  });
};

const finalizeUpload = mediaId => {
  return makePost('media/upload', {
    command: 'FINALIZE',
    media_id: mediaId
  });
};

const tweetIt = (mediaId, title) => {
  const params = {
    status: title,
    media_ids: mediaId
  };
  return makePost('statuses/update', params);
};

const makePost = (endpoint, params) => {
  return new Promise((resolve, reject) => {
    client.post(endpoint, params, (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = tweetImage;
