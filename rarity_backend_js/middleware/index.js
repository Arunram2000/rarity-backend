import Collection from "../schema/collectionShema.js";

export const auth = async (req, res, next) => {
  const { collection_slug } = req.params;
  try {
    const data = await Collection.findOne({ collection_slug });

    if (!data) {
      return res.status(403).json({
        error: true,
        message: `There is no collection with this name ${collection_slug}`,
      });
    }

    if (!data.isVerified)
      return res.status(403).json({
        error: true,
        message: "Your collection is under verification . It'll be live soon",
      });

    req.collectionData = data;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};
