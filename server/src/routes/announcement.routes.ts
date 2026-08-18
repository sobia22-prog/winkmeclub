import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller';

const router = Router();

router.get('/', AnnouncementController.getPublishedAnnouncements);

export default router;
