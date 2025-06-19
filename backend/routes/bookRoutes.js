import express from 'express';
import cloudinary from '../cloudinary.js';
import Book from '../models/Book.model.js';
import protectRoute from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create a book..
router.post('/create', protectRoute, async (req, res) => {
    console.log("Hit create book route");
    try {

        const { title, caption, rating, image } = req.body;

        if (!title || !caption || !rating || !image) {
            return res.status(400).json({
                status: 'Failed',
                message: "Please provide all fields."
            });
        }

        // Upload the image to cloudinary...
        const imageUploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = imageUploadResponse.secure_url;

        const newBook = new Book({
            title: title,
            caption: caption,
            rating: rating,
            image: imageUrl,
            user: req.user._id
        });

        await newBook.save();

        return res.status(201).json({
            status: 'Ok',
            message: "New Book Created",
            book: newBook
        });

    } catch (error) {
        return res.status(500).json({
            status: 'Failed',
            message: "Internal Server error."
        });
    }
});

router.get('/', protectRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileimage");

        const totalBooksCount = await Book.countDocuments();
        return res.status(200).json({
            status: 'Ok',
            books,
            currentPage: page,
            totalBooks: totalBooksCount,
            totalPages: Math.ceil(totalBooksCount / limit)
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Failed',
            message: "Internal Server Error."
        });
    }
});

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(400).json({
                status: 'Failed',
                message: "Book not found."
            });
        }

        // Optionally: Check if the user is the one who created the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'Failed',
                message: "You are not allowed to delete this book."
            });
        }

        // Delete the image...
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split('/').pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary: ", deleteError);
            }
        }

        await book.deleteOne();

        return res.status(200).json({
            status: 'Ok',
            message: "Book deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            status: 'Failed',
            message: "Internal Server Error."
        });
    }
});

router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({
            status: 'Ok',
            books
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Failed',
            message: "Internal Server Error."
        });
    }
});

export default router;