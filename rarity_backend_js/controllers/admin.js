import Admin from "../schema/adminSchema.js";
import Collection from "../schema/collectionShema.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await Admin.findOne({ username });

    if (!result || result.password !== password)
      return res.json({ error: true, message: "Invalid authentication" });

    res.json(result._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const result = await Admin.findById(req.params.id);

    if (!result) return res.json({ error: true, message: "Invalid authentication" });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const createNewAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const isOldAdmin = await Admin.findOne({ username });

    if (isOldAdmin) {
      return res.json({ error: true, message: "Admin username is already taken" });
    }

    const result = await Admin.create({ username, password });

    res.json(result._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const updatePassword = async (req, res) => {
  const { username, password } = req.body;
  try {
    await Admin.findOneAndUpdate({ username }, { password }, { new: false });

    res.json("password update successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getAllCollectionsByAdmin = async (req, res) => {
  const { pageNo } = req.query;
  const pageSize = 15;
  const skipCount = !pageNo ? 0 : (pageNo - 1) * pageSize;
  try {
    const totalPages = await Collection.count({});
    const collections = await Collection.find({}).skip(skipCount).limit(pageSize);

    res.json({ collections, totalPages: Math.round(totalPages / pageSize) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getCollectionByAdmin = async (req, res) => {
  try {
    const collection = await Collection.findOne({ collection_slug: req.params.collection_slug });

    res.json(collection);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    const data = await Admin.findOne({ username: "admin" });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const collections = await Admin.findOneAndUpdate(
      { username: "admin" },
      { ...req.body },
      { new: true }
    );

    res.json(collections);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const verifyCollection = async (req, res) => {
  const { collection_slug } = req.params;
  try {
    const updates = {
      isVerified: true,
    };
    const data = await Collection.findOneAndUpdate({ collection_slug }, updates, { new: false });

    res.json({ data, error: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};
