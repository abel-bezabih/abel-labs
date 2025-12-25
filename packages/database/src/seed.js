"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, devPassword, developer, clientPassword, client, conversation, brief, project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    return [4 /*yield*/, bcrypt.hash('admin123', 10)];
                case 1:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@abellabs.ca' },
                            update: {},
                            create: {
                                email: 'admin@abellabs.ca',
                                name: 'Admin User',
                                password: adminPassword,
                                role: client_1.UserRole.ADMIN,
                                phone: '+251911234567',
                            },
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, bcrypt.hash('dev123', 10)];
                case 3:
                    devPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'dev@abellabs.ca' },
                            update: {},
                            create: {
                                email: 'dev@abellabs.ca',
                                name: 'Developer User',
                                password: devPassword,
                                role: client_1.UserRole.DEVELOPER,
                                phone: '+251911234568',
                            },
                        })];
                case 4:
                    developer = _a.sent();
                    return [4 /*yield*/, bcrypt.hash('client123', 10)];
                case 5:
                    clientPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'client@example.com' },
                            update: {},
                            create: {
                                email: 'client@example.com',
                                name: 'Sample Client',
                                password: clientPassword,
                                role: client_1.UserRole.CLIENT,
                                phone: '+251911234569',
                            },
                        })];
                case 6:
                    client = _a.sent();
                    return [4 /*yield*/, prisma.aIConversation.create({
                            data: {
                                sessionId: 'sample_session_001',
                                messages: [
                                    {
                                        role: 'user',
                                        content: 'I need a website for my restaurant',
                                        timestamp: new Date(),
                                    },
                                    {
                                        role: 'assistant',
                                        content: 'Great! Tell me more about your restaurant...',
                                        timestamp: new Date(),
                                    },
                                ],
                                intent: client_1.ProjectType.WEBSITE,
                                status: 'COMPLETED',
                            },
                        })];
                case 7:
                    conversation = _a.sent();
                    return [4 /*yield*/, prisma.projectBrief.create({
                            data: {
                                conversationId: conversation.sessionId,
                                projectType: client_1.ProjectType.WEBSITE,
                                businessType: 'Restaurant',
                                features: ['Menu Display', 'Online Reservations', 'Contact Form', 'Gallery'],
                                designPreferences: 'Modern, warm colors, food photography',
                                timeline: '4-6 weeks',
                                budgetRange: '70,000 - 100,000 ETB',
                                summary: 'A modern restaurant website with menu display, online reservations, and gallery.',
                                status: client_1.ProjectStatus.APPROVED,
                                approvedBudget: 85000,
                                approvedCurrency: client_1.Currency.ETB,
                                approvedDeadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days
                            },
                        })];
                case 8:
                    brief = _a.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                title: 'Restaurant Website',
                                description: 'Modern restaurant website with menu display and online reservations',
                                type: client_1.ProjectType.WEBSITE,
                                status: client_1.ProjectStatus.IN_PROGRESS,
                                clientId: client.id,
                                assignedToId: developer.id,
                                briefId: brief.id,
                                budget: 85000,
                                currency: client_1.Currency.ETB,
                                deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
                            },
                        })];
                case 9:
                    project = _a.sent();
                    // Create sample invoice
                    return [4 /*yield*/, prisma.invoice.create({
                            data: {
                                projectId: project.id,
                                invoiceNumber: 'INV-2024-001',
                                amount: 85000,
                                currency: client_1.Currency.ETB,
                                status: 'SENT',
                                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                                items: [
                                    {
                                        description: 'Website Development - Restaurant',
                                        quantity: 1,
                                        unitPrice: 85000,
                                        total: 85000,
                                    },
                                ],
                            },
                        })];
                case 10:
                    // Create sample invoice
                    _a.sent();
                    console.log('✅ Seeding completed!');
                    console.log('📧 Admin: admin@abellabs.ca / admin123');
                    console.log('👨‍💻 Developer: dev@abellabs.ca / dev123');
                    console.log('👤 Client: client@example.com / client123');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
