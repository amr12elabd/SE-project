const Layout = require('../models/Layout');

const getLayout = async (req, res, next) => {
  try {
    const layout = await Layout.findOne({ event: req.params.eventId });
    if (!layout) return res.json({ elements: [], setupInstructions: '', sharedWithStaff: false, canvasWidth: 800, canvasHeight: 600 });
    res.json(layout);
  } catch (err) { next(err); }
};

const saveLayout = async (req, res, next) => {
  try {
    const { elements, setupInstructions, canvasWidth, canvasHeight, sharedWithStaff } = req.body;
    const layout = await Layout.findOneAndUpdate(
      { event: req.params.eventId },
      { event: req.params.eventId, elements, setupInstructions, canvasWidth, canvasHeight, sharedWithStaff },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(layout);
  } catch (err) { next(err); }
};

const shareLayout = async (req, res, next) => {
  try {
    const layout = await Layout.findOneAndUpdate(
      { event: req.params.eventId },
      { sharedWithStaff: true },
      { new: true }
    );
    res.json({ message: 'Layout shared with staff', layout });
  } catch (err) { next(err); }
};

module.exports = { getLayout, saveLayout, shareLayout };
