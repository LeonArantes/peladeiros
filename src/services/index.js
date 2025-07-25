/**
 * Índice central dos serviços
 * Facilita importação e garante uso das instâncias singleton
 */

export { default as userService } from "./userService";
export { default as attendanceService } from "./attendanceService";
export { default as storageService } from "./storageService";
export { default as teamDivisionService } from "./teamDivisionService";
export { default as financialService } from "./financialService";

// Exportações nomeadas para backwards compatibility
export { userService as UserService } from "./userService";
export { attendanceService as AttendanceService } from "./attendanceService";
export { storageService as StorageService } from "./storageService";
export { teamDivisionService as TeamDivisionService } from "./teamDivisionService";
export { financialService as FinancialService } from "./financialService";
