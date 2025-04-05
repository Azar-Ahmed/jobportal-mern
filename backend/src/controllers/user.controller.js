import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.utils.js";
export const register = async (req, res) => {
  try {
    const { fullname, email, number, password, role } = req.body;
    const file = req.file;

    if (!fullname || !email || !number || !password || !role || !file) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // Check for existing user
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered!" });

    // Upload profile photo to Cloudinary
    const fileUri = getDataUri(file);
    const { secure_url: profilePhoto } = await cloudinary.uploader.upload(
      fileUri.content
    );

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      fullname,
      email,
      number,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    let user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credential!" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credential!" });

    // check role is correct or not
    if (role !== user.role) {
      return res.status(400).json({
        success: false,
        message: "Account doesn't exist with current role.",
      });
    }

    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Re-fetch user without password OR remove it before sending
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpsOnly: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: `Welcome back ${user.fullname}`,
        user: userWithoutPassword,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, number, bio, skills } = req.body;
    const file = req.file;
    const userId = req.id;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Update basic fields if provided
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (number) user.number = number;

    // Update profile fields
    if (bio) user.profile.bio = bio;
    if (skills) {
      user.profile.skills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill); // remove empty entries
    }

    // Upload resume if file is provided
    if (file) {
      const fileUri = getDataUri(file);
      const { secure_url } = await cloudinary.uploader.upload(fileUri.content);
      user.profile.resume = secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }

    await user.save();

    // Prepare filtered response
    const responseUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: responseUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
