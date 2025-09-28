import dotenv from "dotenv";
import e from "express";

import Blog from "../models/blogsModel.js";

const BlogsController = {
  AddBlogs: async (req, res) => {
    try {
      const { title, author, date, category, content } = req.body;

      if (!title || !author || !date || !category || !content) {
        return res.status(400).json({ message: "All fields are required" });
      }

      let coverImageUrl;
      if (req.file) {
        coverImageUrl = `/uploads/${req.file.filename}`;
      }

      const doc = await Blog.create({
        title,
        author,
        date,
        category,
        content,
        coverImageUrl,
      });
      return res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
  BlogList: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const category = req.query.category;

      const filter = {};
      if (category) {
        filter.category = category;
      }

      const [items, total] = await Promise.all([
        Blog.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Blog.countDocuments(filter),
      ]);
      return res.json({ items, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ message: "Server error " });
    }
  },
  GetBlog: async (req, res) => {
    try{
      const {id} = req.params;
      if(!id){
        return res.status(400).json({message:"Blog ID is required"});
      }
      const doc = await Blog.findById(id);
      if(!doc){
        return res.status(404).json({message:"Blog not found"});
      }
      return res.json(doc);
    }catch(err){
      res.status(500).json({message:"Server error"});
    }
  },
  UpdateBlog: async (req, res) => {
    try{
      const {id} = req.params;
      if(!id){
        return res.status(400).json({message:"Blog ID is required"});
      }
      const {title, author, date, category, content} = req.body;
      if(!title || !author || !date || !category || !content){
        return res.status(400).json({message:"All fields are required"});
      }
      let coverImageUrl;
      if(req.file){
        coverImageUrl = `/uploads/${req.file.filename}`;
      }
      const doc = await Blog.findByIdAndUpdate(id,{
        title,
        author,
        date,
        category,
        content,
        ...(coverImageUrl && {coverImageUrl}),
      },{new:true});
      if(!doc){
        return res.status(404).json({message:"Blog not found"});
      }
      return res.json(doc);
    }catch(err){
      res.status(500).json({message:"Server error"});
    }
  },
  DeleteBlog: async (req, res) => {
    try{
      const {id} = req.params;
      if(!id){
        return res.status(400).json({message:"Blog ID is required"});
      }
      const doc = await Blog.findByIdAndDelete(id);
      if(!doc){
        return res.status(404).json({message:"Blog not found"});
      }
      return res.json({message:"Blog deleted successfully"});
    }catch(err){
      res.status(500).json({message:"Server error"});
    }
  }
};
export default BlogsController;
