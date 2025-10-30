const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendance,
  correctAttendance,
  addManualAttendance,
  getAttendanceAudit
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.post("/checkin", protect, checkIn);
router.put("/checkout", protect, checkOut);
router.post("/manual", protect, authorize("admin", "manager"), addManualAttendance);
router.get("/user/:userId", protect, getUserAttendance);
router.get("/today/:userId", protect, getTodayAttendance);
router.get("/", protect, authorize("admin", "manager"), getAllAttendance);
router.put("/:id/correct", protect, authorize("admin", "manager"), correctAttendance);
router.get("/:id/audit", protect, authorize("admin", "manager"), getAttendanceAudit);

module.exports = router;
