const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');

const getVendors = async (req, res, next) => {
  try {
    const { category, location, search } = req.query;
    const filter = { isActive: true };
    if (location) filter.mainLocation = new RegExp(location, 'i');
    if (category) filter.suppliesOffered = { $in: [new RegExp(category, 'i')] };
    if (search) filter.$or = [
      { companyName: new RegExp(search, 'i') },
      { mainLocation: new RegExp(search, 'i') }
    ];

    const vendors = await VendorProfile.find(filter)
      .populate('user', 'name email phone avatarUrl isActive')
      .sort('-rating');
    res.json(vendors);
  } catch (err) { next(err); }
};

const getVendorProfile = async (req, res, next) => {
  try {
    let profile = await VendorProfile.findOne({ user: req.user._id }).populate('user', 'name email phone avatarUrl');
    if (!profile) return res.status(404).json({ message: 'Vendor profile not found. Please create one.' });
    res.json(profile);
  } catch (err) { next(err); }
};

const getVendorProfileById = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findById(req.params.id).populate('user', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Vendor not found' });
    res.json(profile);
  } catch (err) { next(err); }
};

const createVendorProfile = async (req, res, next) => {
  try {
    const exists = await VendorProfile.findOne({ user: req.user._id });
    if (exists) return res.status(400).json({ message: 'Vendor profile already exists. Use PUT to update.' });

    const { companyName, suppliesOffered, mainLocation, pricingList, contactInfo, deliveryRegions, minimumOrder, leadTime } = req.body;
    if (!companyName) return res.status(400).json({ message: 'Company name is required' });

    const profile = await VendorProfile.create({
      user: req.user._id, companyName, suppliesOffered, mainLocation, pricingList,
      contactInfo, deliveryRegions, minimumOrder, leadTime
    });
    res.status(201).json(profile);
  } catch (err) { next(err); }
};

const updateVendorProfile = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOneAndUpdate(
      { user: req.user._id }, req.body, { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email phone');
    res.json(profile);
  } catch (err) { next(err); }
};

module.exports = { getVendors, getVendorProfile, getVendorProfileById, createVendorProfile, updateVendorProfile };
