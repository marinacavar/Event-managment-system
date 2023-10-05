const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const port = 3000;
const uri =
  'mongodb+srv://baze:yUuB8aTv0RjhpGnE@event-management-system.ikp4mzy.mongodb.net/';
  
const client = new MongoClient(uri);

(async () => {
  try {
    await client.connect();
    const collection = client
      .db('event-management-system')
      .collection('events');

    app.use(cors());
    app.use(express.json());

    app.post('/events', async (req, res) => {
      try {
        const item = req.body;
        item._id = uuidv4();
        item.createdAt = new Date();
        await collection.insertOne(item);
        res.status(201).send({ message: 'Event successfully created!' });
      } catch (error) {
        res.status(500).send({ message: 'Error inserting item into database' });
      }
    });

    app.get('/formData', async (req, res) => {
      try {
        const db = client.db('event-management-system');

        const venues = await db
          .collection('venues')
          .aggregate([
            {
              $lookup: {
                from: 'cities',
                localField: 'cityId',
                foreignField: '_id',
                as: 'city',
              },
            },
            {
              $unwind: '$city',
            },
          ])
          .toArray();
        const organizators = await db
          .collection('organizators')
          .find()
          .toArray();

        res.json({ venues, organizators });
      } catch (error) {
        console.error('Error retrieving form data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('/events', async (req, res) => {
      const pipeline = [
        {
          $lookup: {
            from: 'venues',
            localField: 'venueId',
            foreignField: '_id',
            as: 'venue',
          },
        },
        {
          $unwind: '$venue',
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'venue.cityId',
            foreignField: '_id',
            as: 'venue.city',
          },
        },
        {
          $lookup: {
            from: 'organizators',
            localField: 'organizators',
            foreignField: '_id',
            as: 'organizators',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            startTime: 1,
            endTime: 1,
            venue: {
              _id: '$venue._id',
              name: '$venue.name',
              address: '$venue.address',
              capacity: '$venue.capacity',
              city: { $arrayElemAt: ['$venue.city', 0] },
            },
            organizators: {
              $map: {
                input: '$organizators',
                as: 'organizator',
                in: {
                  _id: '$$organizator._id',
                  name: '$$organizator.name',
                  email: '$$organizator.email',
                  phone: '$$organizator.phone',
                },
              },
            },
          },
        },
      ];

      try {
        const items = await collection.aggregate(pipeline).toArray();
        res
          .status(200)
          .send({ message: 'Events successfully fetched.', data: items });
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Failed to fetch events.' });
      }
    });

    app.get('/events/:id', async (req, res) => {
      const { id } = req.params;
      const pipeline = [
        {
          $match: {
            _id: id,
          },
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'venue.cityId',
            foreignField: '_id',
            as: 'venue.city',
          },
        },
        {
          $unwind: '$venue.city',
        },
      ];

      try {
        const item = await collection.aggregate(pipeline).toArray();

        if (!item) {
          res.status(404).send({ message: 'Event not found.' });
        } else {
          res.send({ message: 'Event successfully fetched.', data: item });
        }
      } catch (error) {
        res.status(500).send({ message: 'Error reading event from database.' });
      }
    });

    app.put('/events/:id', async (req, res) => {
      const { id } = req.params;
      const item = req.body;

      try {
        const result = await collection.updateOne({ _id: id }, { $set: item });
        if (!result.modifiedCount) {
          res.status(404).send({ message: 'There is nothing to update.' });
        } else {
          res
            .status(200)
            .send({ message: 'Event successfully updated!.', data: item });
        }
      } catch (error) {
        res.status(500).send({ message: 'Failed to update event.' });
      }
    });

    app.delete('/events/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const result = await collection.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
          res.status(404).send({ message: 'Event not found.' });
        } else {
          res.status(200).send({ message: 'Event deleted successfully.' });
        }
      } catch (error) {
        res.status(500).send({ message: 'Failed to delete event.' });
      }
    });

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
})();
