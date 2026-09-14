const funNotesByCategory = {
  birthday: [
    'Hope today feels exactly as good as it should.',
    "Another year, still worth celebrating.",
    'Blow out the candles, keep the wish.',
    'Cake first, everything else later.'
  ],
  anniversary: [
    "Here's to the years already had, and the ones still coming.",
    'Some things are worth marking, every single time.',
    'Still counting the days worth remembering.'
  ],
  apology: [
    'Some words are easier sealed than said out loud.',
    'Better late than never — but never too late to mean it.',
    'This one took longer to send than it should have.'
  ],
  congratulations: [
    'Earned, not given. Well done.',
    'This one was a long time coming.',
    'Deserved, in full.'
  ],
  general: [
    'No occasion needed — some messages just wait for the right moment.',
    'Not every message needs a reason.',
    'Sometimes the thought is the whole point.',
    'Just because, and nothing more.'
  ]
};

function getOccasionCategory(occasion) {
  const o = (occasion || '').toLowerCase();
  if (o.indexOf('birthday') !== -1) return 'birthday';
  if (o.indexOf('anniversary') !== -1) return 'anniversary';
  if (o.indexOf('sorry') !== -1 || o.indexOf('apolog') !== -1) return 'apology';
  if (o.indexOf('congrat') !== -1 || o.indexOf('graduat') !== -1) return 'congratulations';
  return 'general';
}

function pickFunNote(occasion) {
  const category = getOccasionCategory(occasion);
  const notes = funNotesByCategory[category] || funNotesByCategory.general;
  return notes[Math.floor(Math.random() * notes.length)];
}

module.exports = { pickFunNote, getOccasionCategory };
