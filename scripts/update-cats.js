require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const ActivitySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  category: String
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

async function update() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Activity.updateOne({ title: 'Deep Sea Fishing' }, { category: 'fishing' });
    await Activity.updateOne({ title: 'Helicopter Tour Dubai' }, { category: 'helicopter' });
    await Activity.updateOne({ title: 'Scuba Diving Experience' }, { category: 'scuba' });
    console.log('Categories updated successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
update();
