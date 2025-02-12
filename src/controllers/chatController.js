import { ne } from "@faker-js/faker";
import { chatModel } from "../Models/chatModel.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import mongoose from "mongoose";
import { userModel } from "../Models/UserModel.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";
import { messageModel } from "../Models/messageModel.js";
export const newGroupChat = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    if (members.length < 2) {
      return next(
        new ErrorHandler("Group chat must have at least 3 members", 400)
      );
    }
    const allMembers = [...members, req.user];
    console.log(req.user);
    const group = await chatModel.create({
      name,
      groupChat: true,
      creator: req.user,
      members: allMembers,
    });
    return res.status(201).json({
      success: true,
      message: "Group created successfully.",
      group: group,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyChat = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);
    //const chats=await chatModel.find({members:req.user}).populate("members","name avatar");
    const chats = await chatModel.aggregate([
      // Match chats where the user is a member

      { $match: { members: userId } },

      // Lookup user details for members (populate)
      {
        $lookup: {
          from: "users", // Collection name for users
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },

      // Transform the data
      {
        $project: {
          _id: 1,
          name: 1,
          groupChat: 1,
          members: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
        },
      },
    ]);

    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
      const otherMember = members.find(
        (member) => member._id.toString() !== req.user.toString()
      );
      return {
        _id,
        groupChat,
        avatar: groupChat
          ? members.slice(0, 3).map(({ avatar }) => avatar.url)
          : [otherMember.avatar.url],
        name: groupChat ? name : otherMember.name,
        members: members.reduce((prev, curr) => {
          if (curr._id.toString() !== req.user.toString()) {
            prev.push(curr._id);
          }
          return prev;
        }, []),
      };
    });
    return res.status(200).json({
      success: true,
      chats: transformedChats,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyGroups = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);
    const chat = await chatModel.aggregate([
      { $match: { creator: userId } },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $project: {
          id: 1,
          name: 1,
          groupChat: 1,
          avatar: {
            $slice: [
              {
                $map: {
                  input: "$members",
                  as: "member",
                  in: "$$member.avatar.url",
                },
              },
              3, // Take only first 3 avatars
            ],
          },
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      group: chat,
    });
  } catch (error) {}
};
export const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    //console.log(chatId)
    const chat = await chatModel.findById(id);
    if (!chat) {
      return next(new ErrorHandler("Chat Not Found", 404));
    }
    if (!chat.groupChat) {
      return next(
        new ErrorHandler("Members can only be added in group chats.", 403)
      );
    }
    if (chat.creator.toString() != req.user.toString()) {
      return next(new ErrorHandler("You are not allowed to add members", 403));
    }
    if (members.length === 0) {
      return next(new ErrorHandler("Atleast one member is required."));
    }
    members.forEach((mem) => {
      if (!chat.members.includes(mem)) {
        chat.members.push(mem);
      }
    });

    const data = await chat.save();
    return res.status(200).json({
      success: true,
      message: "Member added successfully.",
      chat: data,
    });
  } catch (error) {
    next(error);
  }
};
export const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { member } = req.body;
    //console.log(chatId)
    const chat = await chatModel.findById(id);
    if (!chat) {
      return next(new ErrorHandler("Chat Not Found", 404));
    }
    if (!chat.groupChat) {
      return next(
        new ErrorHandler("Members can only be removedd from group chats.", 403)
      );
    }
    if (chat.creator.toString() != req.user.toString()) {
      return next(
        new ErrorHandler("You are not allowed to remove members", 403)
      );
    }
    if (!member) {
      return next(new ErrorHandler("Member is required."));
    }
    if (chat.members.lemgth <= 3) {
      return next(new ErrorHandler("Group must have atleast 3 member", 400));
    }
    chat.members = chat.members.filter(
      (mem) => mem.toString() != member.toString()
    );
    const data = await chat.save();
    return res.status(200).json({
      success: true,
      message: "Member removed successfully.",
      chat: data,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chat = await chatModel.findById(id);
    if (!chat) {
      return next(new ErrorHandler("Chat not found", 404));
    }
    if (!chat.groupChat) {
      return next(new ErrorHandler("This is not a group chat", 400));
    }

    const remainingMembers = chat.members.filter(
      (mem) => mem.toString() != req.user.toString()
    );
    if (remainingMembers.length < 3)
      return next(new ErrorHandler("Group must have at least 3 members", 400));

    if (chat.creator.toString() === req.user.toString()) {
      const randomElement = Math.floor(Math.random() * remainingMembers.length);
      const newCreator = remainingMembers[randomElement];
      chat.creator = newCreator;
    }
    chat.members = remainingMembers;
    const data = await chat.save();
    return res.status(200).json({
      success: true,
      message: "Leaved successfully.",
      chat: data,
    });
  } catch (error) {
    next(error);
  }
};
export const sendAttachments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    if (files.length < 1)
      return next(new ErrorHandler("Please Upload Attachments", 400));

    if (files.length > 5)
      return next(new ErrorHandler("Files Can't be more than 5", 400));
    const chat = await chatModel.findById(id);
    if (!chat) {
      return next(new ErrorHandler("Chat Not Found", 404));
    }
    const me = await userModel.findById(req.user, "name");
    //console.log(me);
    const attachments = await uploadFilesToCloudinary(files);
    //console.log(attachments)
    const messageForDB = {
      content: " ",
      attachments,
      sender: me._id,
      chat: id,
    };

    const messageForRealTime = {
      ...messageForDB,
      sender: {
        _id: me._id,
        name: me.name,
      },
    };
    const message = await messageModel.create(messageForDB);
    console.log(message);
    // emitEvent(req, NEW_MESSAGE, chat.members, {
    //   message: messageForRealTime,
    //   id,
    // });

    // emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { id });

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getChatDetails = async (req, res, next) => {
  try {
    if (req.query.populate === "true") {
     // console.log(true)
      const chat = await chatModel
        .findById(req.params.id)
        .populate("members", "name avatar")
        .lean();
      if (!chat) {
        return next(new ErrorHandler("Group Not Found"), 404);
      }
      chat.members = chat.members.map((mem) => ({
        _id: mem._id,
        name: mem.name,
        avatar: mem.avatar.url,
      }));
      return res.status(200).json({
        success:true,
        group:chat
      })
    } else {
      //console.log(false)
      const chat=await chatModel.findById(req.params.id);
      if (!chat) {
        return next(new ErrorHandler("Group Not Found"), 404);
      }
      return res.status(200).json({
        success:true,
        group:chat
      })
    }
  } catch (error) {
    next(error)
  }
};
export const renameGroup=async(req,res,next)=>{
  try {
    const {name}=req.body;
    
    
    const chat=await chatModel.findById(req.params.id);
    if(!chat){
      return next(new ErrorHandler("Chat Not Found."));
    }
    if(!chat.groupChat){
      return next(new ErrorHandler("Only group can be rename."));
    }
    if(chat.creator.toString()===req.user){
      return next(new ErrorHandler("You are not allowed to rename",403))
    }
    chat.name=name;
    await chat.save();
    return res.status(200).json({
      success:true,
      message:"Group renamed successfully",
      group:chat
    })

  } catch (error) {
    next(error);
  }
}
export const deleteChat=async(req,res,next)=>{
  try {
    const chat=await chatModel.findById(req.params.id);
    
    if(!chat){
      return next(new ErrorHandler("Chat Not Found",404));
    }
    if(chat.creator.toString()!==req.user){
      return next(new ErrorHandler("You are not allowed delete group."))
    }
    await Promise.allSettled([
      messageModel.deleteMany({chat:req.params.id}),
      chat.deleteOne()
    ]);
    return res.status(200).json({
      success:true, 
      message:"Group deleted successfully.",
      //deletedChat:chat
    })
  } catch (error) {
    next(error);
  }
}
