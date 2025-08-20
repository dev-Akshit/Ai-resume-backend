import * as requestServices from "../services/request.js";
import fs from "fs/promises";
import path from "path";
import { extractAudio, transcribeAudio } from "../libs/media.js";
import { extractDataFromTranscript } from "../libs/transcript.js";
// import { sendEmail } from "../libs/communication.js";

export const uploadVideo = async (req, res) => {
  try {
    const { type } = req.body;
    // const videoUrl = req.file ? req.file.path : req.body.videoUrl;
    const videoUrl = 'C:/Users/HP/OneDrive/Desktop/AI-Resume builder/backend/uploads/videos/test1.mp4'
    // console.log("Video URL:", videoUrl);

    if (!type || !videoUrl) {
      return res.status(400).json({ error: "Type and video are required" });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const profile = await requestServices.findOne({ id: req.session.userId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const audioPath = path.join(
      path.dirname(videoUrl),
      `${path.basename(videoUrl, path.extname(videoUrl))}.mp3`
    );

    await extractAudio(videoUrl, audioPath);
    const transcript = await transcribeAudio(audioPath);
    console.log("Transcript:", transcript);

    const { data } = await extractDataFromTranscript(transcript, type);
    console.log("Extracted Data:", data);

    profile.videos.push({
      type,
      url: videoUrl,
      extractedData: data,
    });
    await requestServices.updateOne(
      { id: profile.id },
      { $set: { videos: profile.videos } },
      { new: true }
    );

    // console.log("Video data saved to profile:", responseData);

    await fs.unlink(audioPath);

    res.status(200).json({
      type,
      url: videoUrl,
      userId: profile.id.toString(),
      extractedData: data,
    });

  } catch (err) {
    console.error("Upload video error:", err);
    res.status(500).json({ error: err.message });
  }

};

export const saveProfile = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }

    const existingProfile = await requestServices.findOne({ id: req.session.userId });
    if (existingProfile && existingProfile.profileStatus >= 1) {
      return res.status(403).json({ error: "Profile already submitted. Further submissions are not allowed." });
    }

    const profileObj = {
      id: req.session.userId,
      ...req.body,
      profilePhoto: req.file ? req.file.path : undefined,
    };

    const profile = await requestServices.save(profileObj);
    // console.log("Profile saved:", profile);

    const responseProfile = {
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      currentOrganization: profile.currentOrganization,
      currentTitle: profile.currentTitle,
      phoneNumber: profile.phoneNumber,
      currentCity: profile.currentCity,
      currentArea: profile.currentArea,
      twitterHandle: profile.twitterHandle,
      instagramProfile: profile.instagramProfile,
      linkedinProfile: profile.linkedinProfile,
      otherSocialHandles: profile.otherSocialHandles,
      briefIntroduction: profile.briefIntroduction,
      inspiringQuote: profile.inspiringQuote,
      joySource: profile.joySource,
      contentLinks: profile.contentLinks.join('\n'),
      profilePhoto: profile.profilePhoto,
    };

    console.log("Response profile:", responseProfile);
    res.status(201).json({ message: "Profile created successfully", ...responseProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchProfile = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const profile = await requestServices.findOne({ id: req.session.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const responseProfile = {
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      currentOrganization: profile.currentOrganization,
      currentTitle: profile.currentTitle,
      phoneNumber: profile.phoneNumber,
      currentCity: profile.currentCity,
      currentArea: profile.currentArea,
      twitterHandle: profile.twitterHandle,
      instagramProfile: profile.instagramProfile,
      linkedinProfile: profile.linkedinProfile,
      otherSocialHandles: profile.otherSocialHandles,
      briefIntroduction: profile.briefIntroduction,
      inspiringQuote: profile.inspiringQuote,
      joySource: profile.joySource,
      contentLinks: profile.contentLinks.join('\n'),
      videos: profile.videos || [],
      profilePhoto: profile.profilePhoto,
    };
    // console.log("Profile fetched:", responseProfile);
    res.status(200).json(responseProfile);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: err.message });
  }
}

export const fetchProfileStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const profile = await requestServices.findOne({ id: userId });
    // console.log("Profile fetched:", profile);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // console.log("Profile status:", profile.profileStatus);
    res.json(profile.profileStatus || 0);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfileStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { status } = req.body;

    if (typeof status !== 'number') {
      return res.status(400).json({ error: "Status must be a number" });
    }

    const profile = await requestServices.updateOne(
      { id: userId },
      { $set: { profileStatus: status } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile.profileStatus);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

export const updateVideoData = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { section } = req.params;
    const { extractedData, tags } = req.body;

    const profile = await requestServices.findOne({ id: req.session.userId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const videoIndex = profile.videos.findIndex(v => v.type === section);
    if (videoIndex === -1) {
      return res.status(404).json({ error: "Video not found for this section" });
    }

    // update extracted data + tags
    profile.videos[videoIndex].extractedData = extractedData;
    profile.videos[videoIndex].tags = tags;

    await requestServices.updateOne(
      { id: profile.id },
      { $set: { videos: profile.videos } },
      { new: true }
    );

    res.status(200).json(profile.videos[videoIndex]);
  } catch (err) {
    console.error("Update video data error:", err);
    res.status(500).json({ error: err.message });
  }
};
