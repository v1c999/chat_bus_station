const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.scheduledClearMessages = functions.pubsub
  .schedule('53 12 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    const db = admin.database();
    const chatroomsRef = db.ref('chatrooms');

    try {
      console.log('Starting scheduled message clear operation');

      const snapshot = await chatroomsRef.once('value');
      const chatrooms = snapshot.val();

      if (!chatrooms) {
        console.log('No chatrooms found. Nothing to clear.');
        return null;
      }

      const clearPromises = [];

      for (const roomName in chatrooms) {
        console.log(`Clearing messages in room: ${roomName}`);
        const clearPromise = chatroomsRef.child(roomName).child('messages').set(null)
          .then(() => {
            console.log(`Successfully cleared messages in room: ${roomName}`);
          })
          .catch((error) => {
            console.error(`Error clearing messages in room ${roomName}:`, error);
          });
        clearPromises.push(clearPromise);
      }

      await Promise.all(clearPromises);

      console.log('All chatrooms cleared successfully');
      return null;
    } catch (error) {
      console.error('Error in scheduledClearMessages function:', error);
      return null;
    }
  });