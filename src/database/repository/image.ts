import mongoose from "mongoose";
import ImageModel, { Image } from "../schemas/image";
import connectToDatabase from "../connection";

class ImageRepository {
  async createImage(url: string, prompt: string): Promise<Image> {
    const image = new ImageModel({
      url,
      createdAt: new Date(),
      prompt,
    });
    image._id = new mongoose.Types.ObjectId();
    await image.save({
      wtimeout: 25000,
    }).catch((error) => {
      console.log(error);
    });
    return image as Image;
  }
  async listImages(): Promise<Image[]> {
    const images = await ImageModel.find();
    if (images.length === 0) {
      return [];
    }
    return images as Image[];
  }
  async getImageById(id: string): Promise<Image | null> {
    const image = await ImageModel.findById(id);
    if (!image) {
      return null;
    }
    return image as Image;
  }
  async updateImage(id: string, update: Partial<Image>): Promise<Image | null> {
    const image = await ImageModel.findByIdAndUpdate(id, update, { new: true });
    if (!image) {
      return null;
    }
    return image as Image;
  }
  async deleteImage(id: string): Promise<void> {
    await ImageModel.findByIdAndDelete(id);
  }
}

export default ImageRepository;
