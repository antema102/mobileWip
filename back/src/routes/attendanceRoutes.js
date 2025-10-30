const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendance,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.post("/checkin", protect, checkIn);
router.put("/checkout", protect, checkOut);
router.get("/user/:userId", protect, getUserAttendance);
router.get("/today/:userId", protect, getTodayAttendance);
router.get("/", protect, authorize("admin", "manager"), getAllAttendance);

module.exports = router;
