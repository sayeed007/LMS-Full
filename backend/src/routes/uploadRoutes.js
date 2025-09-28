const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, uploadFile, deleteFile } = require('../controllers/uploadController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             filename:
 *               type: string
 *               description: Original filename
 *             url:
 *               type: string
 *               description: Public URL of uploaded file
 *             fileSize:
 *               type: number
 *               description: File size in bytes
 *             mimeType:
 *               type: string
 *               description: MIME type of the file
 *             uploadedAt:
 *               type: string
 *               format: date-time
 *               description: Upload timestamp
 *     FileMetadata:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         mimeType:
 *           type: string
 *         fileSize:
 *           type: number
 *         url:
 *           type: string
 *         uploadedBy:
 *           type: string
 *           description: User ID who uploaded the file
 *         category:
 *           type: string
 *           enum: [image, document, video, audio, other]
 *         isPublic:
 *           type: boolean
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         uploadedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     summary: Upload an image file
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, WebP)
 *               category:
 *                 type: string
 *                 enum: [avatar, thumbnail, content, banner, logo]
 *                 description: Image category
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the image is publicly accessible
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request - invalid file type or size
 *       413:
 *         description: File too large
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/upload/document:
 *   post:
 *     summary: Upload a document file
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT)
 *               category:
 *                 type: string
 *                 enum: [course_material, assignment, resource, certificate]
 *                 description: Document category
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the document is publicly accessible
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               courseId:
 *                 type: string
 *                 description: Associated course ID (if applicable)
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request - invalid file type or size
 *       413:
 *         description: File too large
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/upload/video:
 *   post:
 *     summary: Upload a video file (Instructor/Admin only)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload (MP4, AVI, MOV, WMV)
 *               category:
 *                 type: string
 *                 enum: [lesson, demo, presentation, other]
 *                 description: Video category
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the video is publicly accessible
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               courseId:
 *                 type: string
 *                 description: Associated course ID (if applicable)
 *               lessonId:
 *                 type: string
 *                 description: Associated lesson ID (if applicable)
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request - invalid file type or size
 *       413:
 *         description: File too large
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/v1/upload/audio:
 *   post:
 *     summary: Upload an audio file (Instructor/Admin only)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file to upload (MP3, WAV, OGG, AAC)
 *               category:
 *                 type: string
 *                 enum: [lecture, podcast, music, sound_effect, other]
 *                 description: Audio category
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the audio is publicly accessible
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               courseId:
 *                 type: string
 *                 description: Associated course ID (if applicable)
 *     responses:
 *       200:
 *         description: Audio uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request - invalid file type or size
 *       413:
 *         description: File too large
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/v1/upload/files:
 *   get:
 *     summary: Get user's uploaded files
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, video, audio, other]
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: List of uploaded files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileMetadata'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/upload/files/{id}:
 *   get:
 *     summary: Get file metadata by ID
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FileMetadata'
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete uploaded file
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       204:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (can only delete own files)
 */

/**
 * @swagger
 * /api/v1/upload/bulk:
 *   post:
 *     summary: Upload multiple files at once (Instructor/Admin only)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple files to upload
 *               category:
 *                 type: string
 *                 enum: [course_material, resource, media, other]
 *                 description: Category for all files
 *               courseId:
 *                 type: string
 *                 description: Associated course ID
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags for all files
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UploadResponse'
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           error:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

// Protected routes
router.use(protect);

// File upload routes with Cloudinary integration
router.post('/file', restrictTo('instructor', 'org_admin', 'super_admin'), upload, uploadFile);
router.delete('/file', restrictTo('instructor', 'org_admin', 'super_admin'), deleteFile);

module.exports = router;