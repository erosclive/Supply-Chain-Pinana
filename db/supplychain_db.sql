-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 04, 2025 at 08:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supplychain_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `archived_users`
--

CREATE TABLE `archived_users` (
  `id` int(11) NOT NULL,
  `original_user_id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_orders` int(11) DEFAULT 0,
  `total_revenue` decimal(10,2) DEFAULT 0.00,
  `account_created_date` date DEFAULT NULL,
  `last_active_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `archived_users`
--

INSERT INTO `archived_users` (`id`, `original_user_id`, `username`, `archived_at`, `total_orders`, `total_revenue`, `account_created_date`, `last_active_date`) VALUES
(1, 24, 'Wanpiece', '2025-07-24 13:18:10', 0, 0.00, '2025-04-23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `batch_history`
--

CREATE TABLE `batch_history` (
  `history_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `quantity_sold` decimal(10,2) NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `transaction_id` varchar(50) DEFAULT NULL,
  `moved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batch_history`
--

INSERT INTO `batch_history` (`history_id`, `batch_id`, `product_id`, `batch_code`, `quantity_sold`, `manufacturing_date`, `expiration_date`, `unit_cost`, `transaction_id`, `moved_at`, `notes`) VALUES
(1, 245, 'P036', '20250328-713', 5.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-73771', '2025-03-28 14:56:51', 'Batch depleted through order process'),
(2, 246, 'P036', '20250328-930', 10.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-27684', '2025-03-28 15:04:03', 'Batch depleted through order process'),
(3, 247, 'P036', '20250328-593', 20.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-70791', '2025-03-28 15:06:11', 'Batch depleted through order process'),
(4, 248, 'P036', '20250328-906', 5.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-79399', '2025-03-28 15:14:58', 'Batch depleted through order process'),
(5, 249, 'P036', '20250328-928', 15.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-58087', '2025-03-28 15:58:41', 'Batch depleted through order process');

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `delivery_id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `estimated_delivery_time` datetime DEFAULT NULL,
  `actual_delivery_time` datetime DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `driver_id` varchar(20) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_issues`
--

CREATE TABLE `delivery_issues` (
  `issue_id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `issue_type` enum('delay','damage','wrong_item','missing_item','other') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('reported','investigating','resolved') NOT NULL DEFAULT 'reported',
  `reported_at` datetime NOT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `resolution` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `to_email` varchar(255) NOT NULL,
  `from_email` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `email_type` enum('rejection','approval','notification') DEFAULT 'notification',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_logs`
--

INSERT INTO `email_logs` (`id`, `user_id`, `to_email`, `from_email`, `subject`, `message`, `email_type`, `sent_at`) VALUES
(1, 21, 'fyavetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Fyave,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 12:36:40'),
(2, 21, 'fyavetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Fyave,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 12:39:30'),
(3, 32, 'vanngaming2003@gmail.com', 'wantargaryen@gmail.com', 'Application Status Update - Pinana Gourmet', 'Dear Van,\n\nThank you for your interest in becoming a retailer partner with Pinana Gourmet.\n\nAfter careful review of your application, we regret to inform you that we are unable to approve your retailer application at this time.\n\n**[Please specify your reason here]**\n\nIf you are able to address the concerns mentioned above, you are welcome to submit a new application.\n\nWe appreciate your interest in our products and wish you success in your business endeavors.\n\nBest regards,\nPinana Gourmet Team', 'rejection', '2025-07-24 12:51:48'),
(4, 31, 'vanngaming@gmail.com', 'wantargaryen@gmail.com', 'Application Status Update - Pinana Gourmet', 'Dear Van,\n\nThank you for your interest in becoming a retailer partner with Pinana Gourmet.\n\nAfter careful review of your application, we regret to inform you that we are unable to approve your retailer application at this time.\n\n**[Please specify your reason here]**\n\nIf you are able to address the concerns mentioned above, you are welcome to submit a new application.\n\nWe appreciate your interest in our products and wish you success in your business endeavors.\n\nBest regards,\nPinana Gourmet Team', 'rejection', '2025-07-24 12:52:08'),
(5, 16, 'jhovanmagno74@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Jhovan,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:13:25'),
(6, 21, 'fyavetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Fyave,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:48:33'),
(7, 30, 'tureetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Pepito,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:48:53'),
(8, 30, 'tureetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Pepito,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:49:16'),
(9, 30, 'tureetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Pepito,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:49:55'),
(10, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Noine,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:54:55'),
(11, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Noine,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:55:43'),
(12, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Noine,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:57:48'),
(13, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Noine,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:58:48'),
(14, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Noine,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 13:59:26'),
(15, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Application Status Update - Pinana Gourmet', 'Dear Noine,\n\nThank you for your interest in becoming a retailer partner with Pinana Gourmet.\n\nAfter careful review of your application, we regret to inform you that we are unable to approve your retailer application at this time.\n\n**[Please specify your reason here]**\n\nIf you are able to address the concerns mentioned above, you are welcome to submit a new application.\n\nWe appreciate your interest in our products and wish you success in your business endeavors.\n\nBest regards,\nPinana Gourmet Team', 'rejection', '2025-07-24 14:00:35'),
(16, 34, 'noinetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Noine,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 14:01:25'),
(17, 21, 'fyavetargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Fyave,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 18:00:59'),
(18, 12, 'eighthtargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Eighth,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 18:02:15'),
(19, 13, 'aeroizclive@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Aeroiz,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 18:04:15'),
(20, 32, 'vanngaming2003@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Van,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-24 19:19:47'),
(21, 35, 'siextargaryen@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear Siex,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-27 12:45:24'),
(22, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:20:37'),
(23, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:22:59'),
(24, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:23:25'),
(25, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:29:08'),
(26, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:29:45'),
(27, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:36:48'),
(28, 35, 'eldarthewizard@enchantedkigdom.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear OTAP HUB,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:42:27'),
(29, 32, 'benchlaxa5@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear LIKHANG,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 02:46:51'),
(30, 43, 'pural.johnashleyc@gmail.com', 'wantargaryen@gmail.com', 'Congratulations! Your Retailer Application has been Approved - Pinana Gourmet', 'Dear A,\n\nCongratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.\n\nWelcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.\n\n**Next Steps:**\n1. Log in to your account using your registered credentials.\n2. Get started with managing your inventory, orders, and billing.\n3. Contact our support team if you need any assistance.\n\nWe look forward to a successful partnership with you.\n\nBest regards,\nPinana Gourmet Team', 'approval', '2025-07-28 07:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `equipment_usage`
--

CREATE TABLE `equipment_usage` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `equipment_name` varchar(255) NOT NULL,
  `equipment_id` varchar(100) DEFAULT NULL,
  `usage_start` datetime NOT NULL,
  `usage_end` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `operator` varchar(255) DEFAULT NULL,
  `power_consumption_kwh` decimal(8,3) DEFAULT NULL,
  `maintenance_required` tinyint(1) DEFAULT 0,
  `efficiency_percentage` decimal(5,2) DEFAULT 100.00,
  `downtime_minutes` int(11) DEFAULT 0,
  `downtime_reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fixed_pineapple_supplier`
--

CREATE TABLE `fixed_pineapple_supplier` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_info` varchar(255) NOT NULL,
  `farm_location` varchar(255) NOT NULL,
  `delivery_info` enum('Business Driver','Pick Up','Other') NOT NULL,
  `communication_mode` enum('Text','Call','WhatsApp','Other') NOT NULL,
  `notes` text DEFAULT NULL,
  `harvest_season` varchar(100) NOT NULL,
  `planting_cycle` varchar(100) NOT NULL,
  `variety` varchar(100) NOT NULL,
  `shelf_life` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fixed_pineapple_supplier`
--

INSERT INTO `fixed_pineapple_supplier` (`id`, `name`, `contact_info`, `farm_location`, `delivery_info`, `communication_mode`, `notes`, `harvest_season`, `planting_cycle`, `variety`, `shelf_life`, `created_at`, `updated_at`) VALUES
(1, 'Calauan Pineapple Farm', '+63 9495027266', '', 'Business Driver', 'Text', 'Our primary pineapple supplier with premium quality', 'Year-round with peak in summer', '12-18 months', 'MD-2 Sweet Gold', '5-7 days at room temperature, 10-14 days refrigerated', '2025-05-15 12:42:40', '2025-07-22 08:57:50');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_log`
--

CREATE TABLE `inventory_log` (
  `log_id` int(11) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `change_type` enum('order_completion','manual_adjustment','return','restock') NOT NULL,
  `quantity` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `previous_stock` int(11) NOT NULL,
  `new_stock` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `batch_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_log`
--

INSERT INTO `inventory_log` (`log_id`, `product_id`, `change_type`, `quantity`, `order_id`, `previous_stock`, `new_stock`, `notes`, `batch_details`, `created_at`, `created_by`) VALUES
(71, 'DT778014', 'order_completion', 50, NULL, 69, 19, 'Regular deduction', NULL, '2025-07-28 04:33:20', NULL),
(72, 'SN389250', 'order_completion', 30, NULL, 50, 20, 'FIFO batch deduction', '[{\"batch_id\":392,\"batch_code\":\"B1753674592230\",\"deducted\":30,\"remaining\":20,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 04:37:13', NULL),
(73, 'DT111109', 'order_completion', 30, NULL, 80, 50, 'Regular deduction', NULL, '2025-07-28 04:54:00', NULL),
(74, 'SN929962', 'order_completion', 30, NULL, 50, 20, 'FIFO batch deduction', '[{\"batch_id\":391,\"batch_code\":\"B1753674299438\",\"deducted\":30,\"remaining\":20,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 04:54:06', NULL),
(75, 'DT111109', 'order_completion', 40, NULL, 50, 10, 'Regular deduction', NULL, '2025-07-28 05:09:46', NULL),
(76, 'PR685989', 'order_completion', 40, NULL, 80, 40, 'FIFO batch deduction', '[{\"batch_id\":398,\"batch_code\":\"B1753675774976\",\"deducted\":30,\"remaining\":0,\"expiration_date\":\"2025-09-28\"},{\"batch_id\":400,\"batch_code\":\"B1753679960051\",\"deducted\":10,\"remaining\":40,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 05:20:54', NULL),
(77, 'DT111109', 'order_completion', 40, 400, 60, 20, 'Regular deduction', NULL, '2025-07-28 05:40:45', NULL),
(78, 'PR381938', 'order_completion', 40, 400, 80, 40, 'FIFO batch deduction', '[{\"batch_id\":396,\"batch_code\":\"B1753675500476\",\"deducted\":30,\"remaining\":0,\"expiration_date\":\"2025-09-28\"},{\"batch_id\":401,\"batch_code\":\"B1753681161041\",\"deducted\":10,\"remaining\":40,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 05:40:45', NULL),
(79, 'PR685989', 'order_completion', 30, 401, 40, 10, 'FIFO batch deduction', '[{\"batch_id\":400,\"batch_code\":\"B1753679960051\",\"deducted\":30,\"remaining\":10,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 05:50:32', NULL),
(80, 'PR381938', 'order_completion', 30, 402, 40, 10, 'FIFO batch deduction', '[{\"batch_id\":401,\"batch_code\":\"B1753681161041\",\"deducted\":30,\"remaining\":10,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 05:57:45', NULL),
(81, 'PR685989', 'order_completion', 40, 402, 60, 20, 'FIFO batch deduction', '[{\"batch_id\":400,\"batch_code\":\"B1753679960051\",\"deducted\":10,\"remaining\":0,\"expiration_date\":\"2025-09-28\"},{\"batch_id\":402,\"batch_code\":\"B1753682184598\",\"deducted\":30,\"remaining\":20,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 05:57:45', NULL),
(82, 'BV954207', 'order_completion', 30, 403, 30, 0, 'FIFO batch deduction', '[{\"batch_id\":399,\"batch_code\":\"B1753676022433\",\"deducted\":30,\"remaining\":0,\"expiration_date\":\"2025-09-28\"}]', '2025-07-28 06:01:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `last_check_times`
--

CREATE TABLE `last_check_times` (
  `id` int(11) NOT NULL,
  `check_type` varchar(50) NOT NULL,
  `last_check_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `last_check_times`
--

INSERT INTO `last_check_times` (`id`, `check_type`, `last_check_time`) VALUES
(1, 'retailer_orders', '2025-04-24 10:49:37');

-- --------------------------------------------------------

--
-- Table structure for table `material_batches`
--

CREATE TABLE `material_batches` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `batch_number` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cost` decimal(10,2) NOT NULL,
  `date_received` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `receipt_file` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_batches`
--

INSERT INTO `material_batches` (`id`, `material_id`, `batch_number`, `quantity`, `cost`, `date_received`, `expiry_date`, `receipt_file`, `notes`, `created_at`, `updated_at`) VALUES
(42, 41, 1, 50.00, 1500.00, '2025-06-20', '2026-03-21', NULL, '', '2025-07-27 16:34:03', NULL),
(43, 42, 1, 454.00, 120.00, '2025-06-20', '2026-03-21', NULL, '', '2025-07-27 16:38:03', NULL),
(44, 43, 1, 25.00, 1120.00, '2025-06-20', '2027-03-18', NULL, '', '2025-07-27 16:40:55', NULL),
(45, 44, 1, 2.00, 152.00, '2025-06-20', '2027-07-23', NULL, '', '2025-07-27 16:44:28', NULL),
(46, 45, 1, 2.00, 1500.00, '2025-06-20', '2025-12-31', NULL, 'Unopened lard can last up to a year in the pantry, or even longer in the refrigerator or freezer. Once opened, it\'s best used within six months from the pantry or a year if refrigerated.', '2025-07-27 16:49:01', NULL),
(47, 46, 1, 150.00, 1550.00, '2025-06-20', NULL, NULL, '', '2025-07-27 16:52:51', NULL),
(48, 47, 1, 100.00, 400.00, '2025-06-29', NULL, NULL, NULL, '2025-07-27 16:57:42', '2025-07-28 10:56:48'),
(49, 48, 1, 20.00, 2200.00, '2025-05-30', '2025-08-02', NULL, '', '2025-07-27 17:11:28', NULL),
(50, 49, 1, 50.00, 2250.00, '2025-06-18', NULL, NULL, '', '2025-07-27 17:17:17', NULL),
(51, 50, 1, 1.00, 1.00, '2025-07-27', '2025-07-28', NULL, '', '2025-07-28 07:19:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `material_containers`
--

CREATE TABLE `material_containers` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `container_type` enum('dozen','pack','box','unit') NOT NULL,
  `total_pieces` int(11) NOT NULL,
  `used_pieces` int(11) DEFAULT 0,
  `remaining_pieces` int(11) NOT NULL,
  `status` enum('unopened','opened','empty') DEFAULT 'unopened',
  `opened_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `material_usage_log`
--

CREATE TABLE `material_usage_log` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `containers_opened` int(11) DEFAULT 0,
  `pieces_used` decimal(10,3) NOT NULL,
  `pieces_remaining` decimal(10,3) DEFAULT 0.000,
  `usage_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `production_batch_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `measurement_conversions`
--

CREATE TABLE `measurement_conversions` (
  `id` int(11) NOT NULL,
  `from_unit` varchar(50) NOT NULL,
  `to_unit` varchar(50) NOT NULL,
  `conversion_factor` decimal(10,6) NOT NULL,
  `category` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `notification_id` varchar(50) NOT NULL,
  `related_id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `notification_id`, `related_id`, `type`, `message`, `is_read`, `created_at`, `read_at`, `user_id`) VALUES
(1, 'notif_68826f3c02f14', '379', 'new_order', 'New order (RO-20250724-001) from Sevence Targaryens. Expected delivery on Jul 27, 2025', 1, '2025-07-24 17:37:00', '2025-07-24 19:37:43', NULL),
(2, 'notif_688285818b99f', '380', 'new_order', 'New order (RO-20250724-002) from Eighth Targaryen. Expected delivery on Jul 27, 2025', 1, '2025-07-24 19:12:01', '2025-07-24 19:37:42', NULL),
(3, 'notif_68828778d971d', '381', 'new_order', 'New order (RO-20250724-003) from Eighth Targaryen. Expected delivery on Jul 27, 2025', 1, '2025-07-24 19:20:24', '2025-07-24 19:37:39', NULL),
(4, 'notif_68828e3ba872c', '380', 'order_cancelled', 'Order #380 has been cancelled by the user.', 1, '2025-07-24 19:49:15', '2025-07-24 19:50:48', NULL),
(5, 'notif_688292d416644', '379', 'order_status_update', 'Order #RO-20250724-001 status updated to \'confirmed\' by admin.', 1, '2025-07-24 20:08:52', '2025-07-24 20:10:36', NULL),
(6, 'notif_6882931001277', '381', 'order_status_update', 'Order #RO-20250724-003 status updated to \'confirmed\' by admin.', 1, '2025-07-24 20:09:52', '2025-07-24 20:10:33', NULL),
(7, 'notif_68829cba25cc3', '382', 'new_order', 'New order (RO-20250724-004) from Eighth Targaryen. Expected delivery on Jul 27, 2025', 1, '2025-07-24 20:51:06', '2025-07-24 20:51:16', NULL),
(8, 'notif_68829f497595c', '383', 'new_order', 'New order (RO-20250724-005) from Eighth Targaryen. Expected delivery on Jul 27, 2025', 1, '2025-07-24 21:02:01', '2025-07-24 21:02:46', NULL),
(9, 'notif_6882a50a2e75b', '384', 'new_order', 'New order (RO-20250724-006) from Eighth Targaryen. Expected delivery on Jul 27, 2025', 1, '2025-07-24 21:26:34', '2025-07-24 21:26:49', 12),
(10, 'notif_6883a5284c126', '385', 'new_order', 'New order (RO-20250725-001) from Eighth Targaryen. Expected delivery on Jul 28, 2025', 1, '2025-07-25 15:39:20', '2025-07-25 15:39:29', 12),
(11, 'notif_6883a89fd1fff', '386', 'new_order', 'New order (RO-20250725-002) from Sevence Targaryens. Expected delivery on Jul 28, 2025', 1, '2025-07-25 15:54:07', '2025-07-25 16:37:54', 19),
(12, 'notif_6883b9869c76b', '387', 'new_order', 'New order (RO-20250725-003) from Sevence Targaryens. Expected delivery on Jul 28, 2025', 1, '2025-07-25 17:06:14', '2025-07-25 17:06:25', 19),
(13, 'notif_6885c2bb94a29', '388', 'new_order', 'New order (RO-20250727-001) from Sevence Targaryens. Expected delivery on Jul 30, 2025', 1, '2025-07-27 06:10:03', '2025-07-27 06:10:12', 19),
(14, 'notif_6885c2d6d1a8c', '388', 'order_cancelled', 'Order #388 has been cancelled by the reseller.', 1, '2025-07-27 06:10:30', '2025-07-27 06:13:00', 19),
(15, 'notif_6885c2e782490', '389', 'new_order', 'New order (RO-20250727-001) from Sevence Targaryens. Expected delivery on Jul 30, 2025', 1, '2025-07-27 06:10:47', '2025-07-27 06:12:58', 19),
(16, 'notif_6885c3760773f', '389', 'order_cancelled', 'Order #389 has been cancelled by the reseller.', 1, '2025-07-27 06:13:10', '2025-07-27 12:48:10', 19),
(17, 'notif_6885cd412d25f', '390', 'new_order', 'New order (RO-20250727-002) from Sevence Targaryens. Expected delivery on Jul 30, 2025', 1, '2025-07-27 06:54:57', '2025-07-27 12:48:11', 19),
(18, 'notif_68861ff32c3e5', '391', 'new_order', 'New order (RO-20250727-003) from Siex Targaryen. Expected delivery on Jul 30, 2025', 1, '2025-07-27 12:47:47', '2025-07-27 12:52:59', 35),
(19, 'notif_688621a757fbd', '392', 'new_order', 'New order (RO-20250727-004) from Sevence Targaryens. Expected delivery on Jul 30, 2025', 1, '2025-07-27 12:55:03', '2025-07-27 13:01:42', 19),
(20, 'notif_68867091b0305', '393', 'new_order', 'New order (RO-20250727-005) from Sevence Targaryens. Expected delivery on Jul 30, 2025', 1, '2025-07-27 18:31:45', '2025-07-27 18:47:55', 19),
(21, 'notif_6886fd3240a4c', '394', 'new_order', 'New order (RO-20250728-001) from LIKHANG LAGUNA. Expected delivery on Jul 31, 2025', 0, '2025-07-28 04:31:46', NULL, 32),
(22, 'notif_6886fe3721245', '395', 'new_order', 'New order (RO-20250728-002) from LIKHANG LAGUNA. Expected delivery on Jul 31, 2025', 0, '2025-07-28 04:36:07', NULL, 32),
(23, 'notif_6887003226cf7', '396', 'new_order', 'New order (RO-20250728-003) from OTOP HUB UPLB. Expected delivery on Jul 31, 2025', 0, '2025-07-28 04:44:34', NULL, 21),
(24, 'notif_68870050a8a1a', '397', 'new_order', 'New order (RO-20250728-004) from OTOP HUB UPLB. Expected delivery on Jul 31, 2025', 0, '2025-07-28 04:45:04', NULL, 21),
(25, 'notif_688705af40f7e', '398', 'new_order', 'New order (RO-20250728-005) from OTAP HUB EK. Expected delivery on Jul 31, 2025', 0, '2025-07-28 05:07:59', NULL, 35),
(26, 'notif_688708832f4e1', '399', 'new_order', 'New order (RO-20250728-006) from OTAP HUB EK. Expected delivery on Jul 31, 2025', 0, '2025-07-28 05:20:03', NULL, 35),
(27, 'notif_68870d30364ba', '400', 'new_order', 'New order (RO-20250728-001) from OTOP HUB UPLB. Expected delivery on Jul 31, 2025', 0, '2025-07-28 05:40:00', NULL, 21),
(28, 'notif_68870f7c96611', '401', 'new_order', 'New order (RO-20250728-002) from OTAP HUB EK. Expected delivery on Jul 31, 2025', 0, '2025-07-28 05:49:48', NULL, 35),
(29, 'notif_6887112d5827f', '402', 'new_order', 'New order (RO-20250728-003) from LIKHANG LAGUNA. Expected delivery on Jul 31, 2025', 0, '2025-07-28 05:57:01', NULL, 32),
(30, 'notif_6887120e08010', '403', 'new_order', 'New order (RO-20250728-004) from LIKHANG LAGUNA. Expected delivery on Jul 31, 2025', 0, '2025-07-28 06:00:46', NULL, 32);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `order_date` date NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_batch_usage`
--

CREATE TABLE `order_batch_usage` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `quantity_used` int(11) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `payment_platform` varchar(50) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_history`
--

CREATE TABLE `payment_history` (
  `history_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `previous_status` enum('pending','partial','completed') NOT NULL,
  `new_status` enum('pending','partial','completed') NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pos_payment_methods`
--

CREATE TABLE `pos_payment_methods` (
  `payment_method_id` int(11) NOT NULL,
  `method_name` varchar(50) NOT NULL,
  `method_description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `requires_reference` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_payment_methods`
--

INSERT INTO `pos_payment_methods` (`payment_method_id`, `method_name`, `method_description`, `is_active`, `requires_reference`, `created_at`, `updated_at`) VALUES
(1, 'Cash', 'Cash payment', 1, 0, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(2, 'Credit Card', 'Credit card payment', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(3, 'Debit Card', 'Debit card payment', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(4, 'Mobile Payment', 'GCash, Maya, etc.', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(5, 'Bank Transfer', 'Direct bank transfer', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28');

-- --------------------------------------------------------

--
-- Table structure for table `pos_shifts`
--

CREATE TABLE `pos_shifts` (
  `shift_id` int(11) NOT NULL,
  `cashier_id` varchar(20) NOT NULL,
  `cashier_name` varchar(100) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `starting_cash` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ending_cash` decimal(10,2) DEFAULT NULL,
  `total_sales` decimal(10,2) DEFAULT NULL,
  `total_refunds` decimal(10,2) DEFAULT NULL,
  `cash_sales` decimal(10,2) DEFAULT NULL,
  `card_sales` decimal(10,2) DEFAULT NULL,
  `other_sales` decimal(10,2) DEFAULT NULL,
  `expected_cash` decimal(10,2) DEFAULT NULL,
  `cash_difference` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pos_transactions`
--

CREATE TABLE `pos_transactions` (
  `transaction_id` varchar(20) NOT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `customer_id` varchar(20) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT 'Guest',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `cashier_id` varchar(20) NOT NULL,
  `cashier_name` varchar(100) NOT NULL,
  `store_id` varchar(20) NOT NULL DEFAULT '001',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_transactions`
--

INSERT INTO `pos_transactions` (`transaction_id`, `transaction_date`, `customer_id`, `customer_name`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `status`, `notes`, `cashier_id`, `cashier_name`, `store_id`, `created_at`, `updated_at`) VALUES
('PG-27700', '2025-07-28 14:05:30', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-07-28 06:05:30', '2025-07-28 06:05:30'),
('PG-69605', '2025-07-28 10:49:55', NULL, 'Guest', 40.00, 0.00, 0.00, 40.00, 'completed', NULL, '001', 'Admin User', '001', '2025-07-28 02:49:55', '2025-07-28 02:49:55'),
('PG-85586', '2025-07-28 14:06:12', NULL, 'Guest', 180.00, 0.00, 0.00, 180.00, 'completed', NULL, '001', 'Admin User', '001', '2025-07-28 06:06:12', '2025-07-28 06:06:12'),
('PG-97429', '2025-07-28 14:04:00', NULL, 'yi', 1905.00, 0.00, 0.00, 1905.00, 'completed', NULL, '001', 'Admin User', '001', '2025-07-28 06:04:00', '2025-07-28 06:04:00');

-- --------------------------------------------------------

--
-- Table structure for table `pos_transaction_items`
--

CREATE TABLE `pos_transaction_items` (
  `item_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_transaction_items`
--

INSERT INTO `pos_transaction_items` (`item_id`, `transaction_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `discount_percent`, `discount_amount`, `tax_percent`, `tax_amount`, `subtotal`, `total_price`, `created_at`) VALUES
(76, 'PG-69605', 'DT778014', 'Piña Dishwashing Soap Small', 1.000, 40.00, 0.00, 0.00, 0.00, 0.00, 40.00, 40.00, '2025-07-28 02:49:55'),
(77, 'PG-97429', 'SN929962', 'Pina Bars Pouch', 1.000, 130.00, 0.00, 0.00, 0.00, 0.00, 130.00, 130.00, '2025-07-28 06:04:00'),
(78, 'PG-97429', 'DT778014', 'Piña Dishwashing Soap Small', 8.000, 40.00, 0.00, 0.00, 0.00, 0.00, 320.00, 320.00, '2025-07-28 06:04:00'),
(79, 'PG-97429', 'PR685989', 'Pina Mangga', 5.000, 95.00, 0.00, 0.00, 0.00, 0.00, 475.00, 475.00, '2025-07-28 06:04:00'),
(80, 'PG-97429', 'SN945200', 'Pina Ube Bars', 7.000, 140.00, 0.00, 0.00, 0.00, 0.00, 980.00, 980.00, '2025-07-28 06:04:00'),
(81, 'PG-27700', 'SN929962', 'Pina Bars Pouch', 1.000, 130.00, 0.00, 0.00, 0.00, 0.00, 130.00, 130.00, '2025-07-28 06:05:30'),
(82, 'PG-85586', 'SN389250', 'Pina Bars Box', 1.000, 180.00, 0.00, 0.00, 0.00, 0.00, 180.00, 180.00, '2025-07-28 06:06:12');

-- --------------------------------------------------------

--
-- Table structure for table `pos_transaction_payments`
--

CREATE TABLE `pos_transaction_payments` (
  `payment_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `payment_method_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(20) NOT NULL DEFAULT 'completed',
  `change_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_transaction_payments`
--

INSERT INTO `pos_transaction_payments` (`payment_id`, `transaction_id`, `payment_method_id`, `amount`, `reference_number`, `payment_date`, `payment_status`, `change_amount`, `notes`, `created_at`, `updated_at`) VALUES
(60, 'PG-69605', 1, 40.00, NULL, '2025-07-28 10:49:55', 'completed', 0.00, NULL, '2025-07-28 02:49:55', '2025-07-28 02:49:55'),
(61, 'PG-97429', 1, 1905.00, NULL, '2025-07-28 14:04:00', 'completed', 0.00, NULL, '2025-07-28 06:04:00', '2025-07-28 06:04:00'),
(62, 'PG-27700', 1, 130.00, NULL, '2025-07-28 14:05:30', 'completed', 0.00, NULL, '2025-07-28 06:05:30', '2025-07-28 06:05:30'),
(63, 'PG-85586', 1, 180.00, NULL, '2025-07-28 14:06:13', 'completed', 0.00, NULL, '2025-07-28 06:06:13', '2025-07-28 06:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `pos_transaction_refunds`
--

CREATE TABLE `pos_transaction_refunds` (
  `refund_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `refund_reason` text NOT NULL,
  `refund_date` datetime NOT NULL DEFAULT current_timestamp(),
  `refunded_by` varchar(20) NOT NULL,
  `refund_method_id` int(11) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productions`
--

CREATE TABLE `productions` (
  `id` int(11) NOT NULL,
  `production_id` varchar(50) NOT NULL,
  `product_id` varchar(20) DEFAULT NULL,
  `product_photo` varchar(255) DEFAULT NULL,
  `recipe_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `batch_size` int(11) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `status` enum('pending','in-progress','quality-check','completed','cancelled','on-hold') DEFAULT 'pending',
  `progress` decimal(5,2) DEFAULT 0.00,
  `start_date` date NOT NULL,
  `estimated_completion` datetime DEFAULT NULL,
  `actual_completion` datetime DEFAULT NULL,
  `estimated_duration_hours` int(11) DEFAULT 8,
  `actual_duration_hours` int(11) DEFAULT NULL,
  `production_type` enum('new-product','existing-batch','custom') DEFAULT 'new-product',
  `recipe_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipe_data`)),
  `auto_create_product` tinyint(1) DEFAULT 1,
  `target_price` decimal(10,2) DEFAULT NULL,
  `target_expiration_days` int(11) DEFAULT 365,
  `notes` text DEFAULT NULL,
  `total_material_cost` decimal(10,2) DEFAULT NULL,
  `total_operational_cost` decimal(10,2) DEFAULT NULL,
  `total_production_cost` decimal(10,2) DEFAULT NULL,
  `cost_per_unit` decimal(10,2) DEFAULT NULL,
  `quality_status` enum('pending','passed','failed','needs-review') DEFAULT 'pending',
  `quality_notes` text DEFAULT NULL,
  `quality_checked_by` int(11) DEFAULT NULL,
  `quality_checked_at` timestamp NULL DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productions`
--

INSERT INTO `productions` (`id`, `production_id`, `product_id`, `product_photo`, `recipe_id`, `product_name`, `category`, `batch_size`, `price`, `priority`, `status`, `progress`, `start_date`, `estimated_completion`, `actual_completion`, `estimated_duration_hours`, `actual_duration_hours`, `production_type`, `recipe_data`, `auto_create_product`, `target_price`, `target_expiration_days`, `notes`, `total_material_cost`, `total_operational_cost`, `total_production_cost`, `cost_per_unit`, `quality_status`, `quality_notes`, `quality_checked_by`, `quality_checked_at`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
(399, 'PROD20250728-3585', 'DT778014', NULL, 235, 'Piña Dishwashing Soap Small', 'Detergent', 70, 40.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 16:00:00', '2025-07-28 02:33:44', 8, 8, 'new-product', '[{\"materialId\":\"48\",\"quantity\":1,\"materialName\":\"Pineapple (Stock: 20 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 08:33:44]', 2200.00, 660.00, 2200.00, 31.43, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 00:33:15', '2025-07-28 00:33:44'),
(400, 'PROD20250728-9408', 'SN000222', NULL, 236, 'Pina Pie', 'Snacks', 5, 180.00, '', 'pending', 0.00, '2025-07-28', '2025-07-28 16:00:00', NULL, 8, NULL, 'new-product', '[{\"materialId\":\"41\",\"quantity\":2,\"materialName\":\"Flour (Stock: 50 Unit)\"}]', 1, NULL, 30, '', 60.00, 0.00, 60.00, 12.00, 'pending', NULL, NULL, NULL, 'admin', 1, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(401, 'PROD20250728-5685', 'SN193806', NULL, 237, 'Pina Pie', 'Snacks', 5, 180.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 16:00:00', '2025-07-28 05:38:14', 8, 8, 'new-product', '[{\"materialId\":\"41\",\"quantity\":3,\"materialName\":\"Flour (Stock: 48 Unit)\"},{\"materialId\":\"46\",\"quantity\":0.1,\"materialName\":\"Egg (Stock: 150 Pieces)\"},{\"materialId\":\"48\",\"quantity\":0.01,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"42\",\"quantity\":2,\"materialName\":\"Butter (Stock: 454 Unit)\"},{\"materialId\":\"44\",\"quantity\":1,\"materialName\":\"Sugar (Stock: 2 Unit)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 11:38:14]', 347.28, 95.00, 347.28, 69.46, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 03:35:53', '2025-07-28 03:38:14'),
(402, 'PROD20250728-2461', 'SN929962', NULL, 238, 'Pina Bars Pouch', 'Snacks', 50, 130.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 12:00:00', '2025-07-28 05:46:01', 4, 4, 'new-product', '[{\"materialId\":\"49\",\"quantity\":0.5,\"materialName\":\"Pouches (Stock: 50 Pieces)\"},{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"41\",\"quantity\":5,\"materialName\":\"Flour (Stock: 48 Unit)\"},{\"materialId\":\"46\",\"quantity\":0.2,\"materialName\":\"Egg (Stock: 150 Pieces)\"},{\"materialId\":\"44\",\"quantity\":0.5,\"materialName\":\"Sugar (Stock: 2 Unit)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 11:46:01]', 1695.25, 400.00, 1695.25, 33.91, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 03:44:48', '2025-07-28 03:46:01'),
(403, 'PROD20250728-1797', 'SN389250', NULL, 239, 'Pina Bars Box', 'Snacks', 50, 180.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 12:00:00', '2025-07-28 05:50:49', 4, 4, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"46\",\"quantity\":0.2,\"materialName\":\"Egg (Stock: 150 Pieces)\"},{\"materialId\":\"42\",\"quantity\":10,\"materialName\":\"Butter (Stock: 454 Unit)\"},{\"materialId\":\"44\",\"quantity\":0.5,\"materialName\":\"Sugar (Stock: 2 Unit)\"},{\"materialId\":\"41\",\"quantity\":5,\"materialName\":\"Flour (Stock: 48 Unit)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 11:50:49]', 572.89, 590.00, 572.89, 11.46, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 03:49:42', '2025-07-28 03:50:49'),
(404, 'PROD20250728-8302', 'SN679699', NULL, 240, 'Pina Putoseko', 'Snacks', 30, 50.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 11:00:00', '2025-07-28 05:55:27', 3, 3, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.01,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"43\",\"quantity\":2,\"materialName\":\"Cornstarch (Stock: 25 Unit)\"},{\"materialId\":\"46\",\"quantity\":0.1,\"materialName\":\"Egg (Stock: 150 Pieces)\"},{\"materialId\":\"41\",\"quantity\":3,\"materialName\":\"Flour (Stock: 48 Unit)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 11:55:27]', 360.35, 510.00, 360.35, 12.01, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 03:54:26', '2025-07-28 03:55:27'),
(405, 'PROD20250728-4662', 'SN945200', NULL, 241, 'Pina Ube Bars', 'Snacks', 30, 140.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 11:00:00', '2025-07-28 05:59:13', 3, 3, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"46\",\"quantity\":0.15,\"materialName\":\"Egg (Stock: 150 Pieces)\"},{\"materialId\":\"42\",\"quantity\":5,\"materialName\":\"Butter (Stock: 454 Unit)\"},{\"materialId\":\"41\",\"quantity\":5,\"materialName\":\"Flour (Stock: 48 Unit)\"},{\"materialId\":\"49\",\"quantity\":0.3,\"materialName\":\"Pouches (Stock: 50 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 11:59:13]', 1131.07, 510.00, 1131.07, 37.70, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 03:58:53', '2025-07-28 03:59:13'),
(406, 'PROD20250728-2414', 'PR175874', NULL, 242, 'Pina Champoy', 'Preserves', 30, 85.50, '', 'completed', 100.00, '2025-07-28', '2025-07-28 11:00:00', '2025-07-28 06:02:45', 3, 3, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.3,\"materialName\":\"Pouches (Stock: 50 Pieces)\"},{\"materialId\":\"41\",\"quantity\":4,\"materialName\":\"Flour (Stock: 48 Unit)\"},{\"materialId\":\"42\",\"quantity\":5,\"materialName\":\"Butter (Stock: 454 Unit)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:02:45]', 867.32, 510.00, 867.32, 28.91, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 04:02:26', '2025-07-28 04:02:45'),
(407, 'PROD20250728-6331', 'PR381938', NULL, 243, 'Pina Tuyo', 'Preserves', 30, 180.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 12:00:00', '2025-07-28 06:05:14', 4, 4, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.3,\"materialName\":\"Pouches (Stock: 50 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:05:14]', 741.00, 510.00, 741.00, 24.70, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 04:04:45', '2025-07-28 04:05:14'),
(408, 'PROD20250728-2179', 'PR529195', NULL, 244, 'Pina Tinapa', 'Preserves', 30, 180.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 12:00:00', '2025-07-28 06:07:42', 4, 4, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.3,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.3,\"materialName\":\"Pouches (Stock: 50 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:07:42]', 1335.00, 510.00, 1335.00, 44.50, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 04:07:13', '2025-07-28 04:07:42'),
(409, 'PROD20250728-3908', 'PR685989', NULL, 245, 'Pina Mangga', 'Preserves', 30, 95.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 12:00:00', '2025-07-28 06:09:41', 4, 4, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.3,\"materialName\":\"Pouches (Stock: 50 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:09:41]', 741.00, 510.00, 741.00, 24.70, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 04:09:27', '2025-07-28 04:09:41'),
(410, 'PROD20250728-2838', 'BV813775', NULL, 246, '130', 'Beverages', 30, 130.00, '', 'in-progress', 10.00, '2025-07-28', '2025-07-28 13:00:00', NULL, 5, NULL, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.1,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"47\",\"quantity\":0.3,\"materialName\":\"Bottles (s M7177) (Stock: 100 Pieces)\"}]', 1, NULL, 30, '', 340.00, 0.00, 340.00, 11.33, 'pending', NULL, NULL, NULL, 'admin', 1, '2025-07-28 04:11:47', '2025-07-28 04:11:53'),
(411, 'PROD20250728-4895', 'BV954207', NULL, 247, 'Pina Concentrate', 'Beverages', 30, 130.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 13:00:00', '2025-07-28 06:13:44', 5, 5, 'new-product', '[{\"materialId\":\"48\",\"quantity\":0.15,\"materialName\":\"Pineapple (Stock: 19 Pieces)\"},{\"materialId\":\"47\",\"quantity\":0.3,\"materialName\":\"Bottles (s M7177) (Stock: 100 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:13:44]', 450.00, 510.00, 450.00, 15.00, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 04:13:26', '2025-07-28 04:13:44'),
(412, 'PROD20250728-8647', 'DT111109', NULL, 248, 'Piña Dishwashing Soap Large', 'Detergent', 30, 60.00, '', 'completed', 100.00, '2025-07-28', '2025-07-28 13:00:00', '2025-07-28 06:16:54', 5, 5, 'new-product', '[{\"materialId\":\"47\",\"quantity\":0.3,\"materialName\":\"Bottles (s M7177) (Stock: 100 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:16:54]', 120.00, 490.00, 120.00, 4.00, '', '', 0, '0000-00-00 00:00:00', 'admin', 1, '2025-07-28 04:15:59', '2025-07-28 04:16:54'),
(413, 'PROD20250728-2665', 'SN389250', NULL, NULL, 'Pina Bars Box', 'Snacks', 50, 0.00, 'normal', 'quality-check', 80.00, '2025-07-28', '0000-00-00 00:00:00', NULL, 8, NULL, 'existing-batch', '[{\"materialId\":\"48\",\"quantity\":0.03,\"materialName\":\"Pineapple (Stock: 18.25 Pieces)\"},{\"materialId\":\"46\",\"quantity\":0.2,\"materialName\":\"Egg (Stock: 149.25 Pieces)\"},{\"materialId\":\"42\",\"quantity\":10,\"materialName\":\"Butter (Stock: 432 Unit)\"},{\"materialId\":\"44\",\"quantity\":0.5,\"materialName\":\"Sugar (Out of Stock)\"},{\"materialId\":\"41\",\"quantity\":5,\"materialName\":\"Flour (Stock: 23 Unit)\"}]', 1, NULL, 30, '', 704.86, 0.00, 704.86, 14.10, 'pending', NULL, NULL, NULL, '0', 1, '2025-07-28 04:18:57', '2025-07-28 05:54:24'),
(414, 'PROD20250728-5077', 'DT111109', NULL, NULL, 'Piña Dishwashing Soap Large', 'Detergent', 50, 0.00, 'normal', 'quality-check', 80.00, '2025-07-28', '0000-00-00 00:00:00', NULL, 8, NULL, 'existing-batch', '[{\"materialId\":\"47\",\"quantity\":0.5,\"materialName\":\"Bottles (s M7177) (Stock: 99.1 Pieces)\"}]', 1, NULL, 30, '', 200.00, 0.00, 200.00, 4.00, 'pending', NULL, NULL, NULL, '0', 1, '2025-07-28 04:41:56', '2025-07-28 04:42:17'),
(415, 'PROD20250728-9314', 'DT111109', NULL, NULL, 'Piña Dishwashing Soap Large', 'Detergent', 50, 0.00, 'normal', 'completed', 100.00, '2025-07-28', '0000-00-00 00:00:00', '2025-07-28 06:44:20', 8, 8, 'existing-batch', '[{\"materialId\":\"47\",\"quantity\":0.5,\"materialName\":\"Bottles (s M7177) (Stock: 98.6 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 12:44:20]', 200.00, 800.00, 200.00, 4.00, '', '', 0, '0000-00-00 00:00:00', '0', 1, '2025-07-28 04:43:52', '2025-07-28 04:44:20'),
(416, 'PROD20250728-5810', 'PR685989', NULL, NULL, 'Pina Mangga', 'Preserves', 50, 0.00, 'normal', 'completed', 100.00, '2025-07-28', '0000-00-00 00:00:00', '2025-07-28 07:19:41', 8, 8, 'existing-batch', '[{\"materialId\":\"48\",\"quantity\":0.04,\"materialName\":\"Pineapple (Stock: 18.22 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.31,\"materialName\":\"Pouches (Stock: 48 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 13:19:41]', 785.50, 850.00, 785.50, 15.71, '', '', 0, '0000-00-00 00:00:00', '0', 1, '2025-07-28 05:19:12', '2025-07-28 05:19:41'),
(417, 'PROD20250728-2121', 'DT111109', NULL, NULL, 'Piña Dishwashing Soap Large', 'Detergent', 50, 0.00, 'normal', 'completed', 100.00, '2025-07-28', '0000-00-00 00:00:00', '2025-07-28 07:38:10', 8, 8, 'existing-batch', '[{\"materialId\":\"47\",\"quantity\":0.51,\"materialName\":\"Bottles (s M7177) (Stock: 98.1 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 13:38:10]', 204.00, 700.00, 204.00, 4.08, '', '', 0, '0000-00-00 00:00:00', '0', 1, '2025-07-28 05:37:42', '2025-07-28 05:38:10'),
(418, 'PROD20250728-8072', 'PR381938', NULL, NULL, 'Pina Tuyo', 'Preserves', 50, 0.00, 'normal', 'completed', 100.00, '2025-07-28', '0000-00-00 00:00:00', '2025-07-28 07:39:22', 8, 8, 'existing-batch', '[{\"materialId\":\"48\",\"quantity\":0.04,\"materialName\":\"Pineapple (Stock: 18.18 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.31,\"materialName\":\"Pouches (Stock: 47.69 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 13:39:22]', 785.50, 0.00, 785.50, 15.71, '', '', 0, '0000-00-00 00:00:00', '0', 1, '2025-07-28 05:39:12', '2025-07-28 05:39:22'),
(419, 'PROD20250728-0397', 'SN929962', NULL, NULL, 'Pina Bars Pouch', 'Snacks', 50, 0.00, 'normal', 'quality-check', 80.00, '2025-07-28', '0000-00-00 00:00:00', NULL, 8, NULL, 'existing-batch', '[{\"materialId\":\"49\",\"quantity\":0.51,\"materialName\":\"Pouches (Stock: 47.38 Pieces)\"},{\"materialId\":\"48\",\"quantity\":0.04,\"materialName\":\"Pineapple (Stock: 18.14 Pieces)\"},{\"materialId\":\"41\",\"quantity\":5.01,\"materialName\":\"Flour (Stock: 18 Unit)\"},{\"materialId\":\"46\",\"quantity\":0.21,\"materialName\":\"Egg (Stock: 149.05 Pieces)\"}]', 1, NULL, 30, '', 1978.50, 0.00, 1978.50, 39.57, 'pending', NULL, NULL, NULL, '0', 1, '2025-07-28 05:53:08', '2025-07-28 05:54:10'),
(420, 'PROD20250728-5362', 'PR685989', NULL, NULL, 'Pina Mangga', 'Preserves', 50, 0.00, 'normal', 'completed', 100.00, '2025-07-28', '0000-00-00 00:00:00', '2025-07-28 07:56:30', 8, 8, 'existing-batch', '[{\"materialId\":\"48\",\"quantity\":0.05,\"materialName\":\"Pineapple (Stock: 18.1 Pieces)\"},{\"materialId\":\"49\",\"quantity\":0.32,\"materialName\":\"Pouches (Stock: 46.87 Pieces)\"}]', 1, 0.00, 30, '\n [Completed: 2025-07-28 13:56:30]', 830.00, 0.00, 830.00, 16.60, '', '', 0, '0000-00-00 00:00:00', '0', 1, '2025-07-28 05:56:14', '2025-07-28 05:56:30');

-- --------------------------------------------------------

--
-- Table structure for table `production_alerts`
--

CREATE TABLE `production_alerts` (
  `id` int(11) NOT NULL,
  `alert_id` varchar(50) NOT NULL,
  `production_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `alert_type` enum('delay','quality','material_shortage','equipment','safety','cost_overrun','temperature','contamination','other') DEFAULT 'other',
  `category` varchar(100) DEFAULT NULL,
  `severity` enum('info','warning','error','critical') DEFAULT 'warning',
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `affected_quantity` decimal(10,3) DEFAULT NULL,
  `estimated_impact` text DEFAULT NULL,
  `status` enum('active','acknowledged','in-progress','resolved','dismissed') DEFAULT 'active',
  `triggered_at` datetime DEFAULT current_timestamp(),
  `acknowledged_by` varchar(255) DEFAULT NULL,
  `acknowledged_at` datetime DEFAULT NULL,
  `resolved_by` varchar(255) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `auto_generated` tinyint(1) DEFAULT 1,
  `escalation_level` int(11) DEFAULT 0,
  `notification_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_analytics`
--

CREATE TABLE `production_analytics` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` decimal(15,4) NOT NULL,
  `metric_unit` varchar(50) DEFAULT NULL,
  `calculation_method` varchar(255) DEFAULT NULL,
  `benchmark_value` decimal(15,4) DEFAULT NULL,
  `variance_percentage` decimal(8,2) DEFAULT NULL,
  `performance_rating` enum('excellent','good','average','poor','critical') DEFAULT NULL,
  `measurement_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_costs`
--

CREATE TABLE `production_costs` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `cost_type` enum('material','labor','electricity','gas','overhead','equipment','packaging','transportation','other') DEFAULT 'material',
  `cost_category` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,3) DEFAULT 1.000,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'PHP',
  `cost_date` date NOT NULL,
  `is_estimated` tinyint(1) DEFAULT 1,
  `supplier_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `allocation_method` enum('direct','proportional','fixed') DEFAULT 'direct',
  `allocation_percentage` decimal(5,2) DEFAULT 100.00,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `variance` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_materials`
--

CREATE TABLE `production_materials` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `required_quantity` decimal(10,4) NOT NULL,
  `required_unit` varchar(50) NOT NULL,
  `consumed_quantity` decimal(10,4) DEFAULT 0.0000,
  `consumed_unit` varchar(50) DEFAULT NULL,
  `base_unit_quantity` decimal(10,4) DEFAULT NULL,
  `conversion_factor` decimal(10,6) DEFAULT NULL,
  `containers_opened` int(11) DEFAULT 0,
  `pieces_used` int(11) DEFAULT 0,
  `remaining_in_container` int(11) DEFAULT NULL,
  `material_batches_used` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`material_batches_used`)),
  `estimated_cost` decimal(10,2) DEFAULT 0.00,
  `actual_cost` decimal(10,2) DEFAULT 0.00,
  `waste_quantity` decimal(10,3) DEFAULT 0.000,
  `waste_percentage` decimal(5,2) DEFAULT 0.00,
  `batch_code` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `consumption_date` datetime DEFAULT NULL,
  `status` enum('planned','reserved','consumed','returned','cancelled') DEFAULT 'planned',
  `allocated_at` timestamp NULL DEFAULT NULL,
  `consumed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_materials`
--

INSERT INTO `production_materials` (`id`, `production_id`, `material_id`, `required_quantity`, `required_unit`, `consumed_quantity`, `consumed_unit`, `base_unit_quantity`, `conversion_factor`, `containers_opened`, `pieces_used`, `remaining_in_container`, `material_batches_used`, `estimated_cost`, `actual_cost`, `waste_quantity`, `waste_percentage`, `batch_code`, `expiration_date`, `consumption_date`, `status`, `allocated_at`, `consumed_at`, `notes`, `created_at`, `updated_at`) VALUES
(366, 399, 48, 1.0000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 2200.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 08:33:44', 'consumed', NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:44'),
(367, 400, 41, 2.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 3000.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(368, 401, 41, 3.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 4500.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:38:14', 'consumed', NULL, NULL, NULL, '2025-07-28 03:35:53', '2025-07-28 03:38:14'),
(369, 401, 46, 0.1000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 155.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:38:14', 'consumed', NULL, NULL, NULL, '2025-07-28 03:35:53', '2025-07-28 03:38:14'),
(370, 401, 48, 0.0100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 22.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:38:14', 'consumed', NULL, NULL, NULL, '2025-07-28 03:35:53', '2025-07-28 03:38:14'),
(371, 401, 42, 2.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 240.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:38:14', 'consumed', NULL, NULL, NULL, '2025-07-28 03:35:53', '2025-07-28 03:38:14'),
(372, 401, 44, 1.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 152.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:38:14', 'consumed', NULL, NULL, NULL, '2025-07-28 03:35:53', '2025-07-28 03:38:14'),
(373, 402, 49, 0.5000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 1125.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:46:01', 'consumed', NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:46:01'),
(374, 402, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:46:01', 'consumed', NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:46:01'),
(375, 402, 41, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 7500.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:46:01', 'consumed', NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:46:01'),
(376, 402, 46, 0.2000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 310.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:46:01', 'consumed', NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:46:01'),
(377, 402, 44, 0.5000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 76.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:46:01', 'consumed', NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:46:01'),
(378, 403, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:50:49', 'consumed', NULL, NULL, NULL, '2025-07-28 03:49:42', '2025-07-28 03:50:49'),
(379, 403, 46, 0.2000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 310.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:50:49', 'consumed', NULL, NULL, NULL, '2025-07-28 03:49:42', '2025-07-28 03:50:49'),
(380, 403, 42, 10.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 1200.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:50:49', 'consumed', NULL, NULL, NULL, '2025-07-28 03:49:42', '2025-07-28 03:50:49'),
(381, 403, 44, 0.5000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 76.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:50:49', 'consumed', NULL, NULL, NULL, '2025-07-28 03:49:42', '2025-07-28 03:50:49'),
(382, 403, 41, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 7500.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:50:49', 'consumed', NULL, NULL, NULL, '2025-07-28 03:49:42', '2025-07-28 03:50:49'),
(383, 404, 48, 0.0100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 22.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:55:27', 'consumed', NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:55:27'),
(384, 404, 43, 2.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 2240.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:55:27', 'consumed', NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:55:27'),
(385, 404, 46, 0.1000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 155.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:55:27', 'consumed', NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:55:27'),
(386, 404, 41, 3.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 4500.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:55:27', 'consumed', NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:55:27'),
(387, 405, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:59:13', 'consumed', NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:59:13'),
(388, 405, 46, 0.1500, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 232.50, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:59:13', 'consumed', NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:59:13'),
(389, 405, 42, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 600.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:59:13', 'consumed', NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:59:13'),
(390, 405, 41, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 7500.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:59:13', 'consumed', NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:59:13'),
(391, 405, 49, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 675.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 11:59:13', 'consumed', NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:59:13'),
(392, 406, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:02:45', 'consumed', NULL, NULL, NULL, '2025-07-28 04:02:26', '2025-07-28 04:02:45'),
(393, 406, 49, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 675.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:02:45', 'consumed', NULL, NULL, NULL, '2025-07-28 04:02:26', '2025-07-28 04:02:45'),
(394, 406, 41, 4.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 6000.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:02:45', 'consumed', NULL, NULL, NULL, '2025-07-28 04:02:26', '2025-07-28 04:02:45'),
(395, 406, 42, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 600.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:02:45', 'consumed', NULL, NULL, NULL, '2025-07-28 04:02:26', '2025-07-28 04:02:45'),
(396, 407, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:05:14', 'consumed', NULL, NULL, NULL, '2025-07-28 04:04:45', '2025-07-28 04:05:14'),
(397, 407, 49, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 675.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:05:14', 'consumed', NULL, NULL, NULL, '2025-07-28 04:04:45', '2025-07-28 04:05:14'),
(398, 408, 48, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 660.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:07:42', 'consumed', NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:42'),
(399, 408, 49, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 675.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:07:42', 'consumed', NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:42'),
(400, 409, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:09:41', 'consumed', NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:41'),
(401, 409, 49, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 675.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:09:41', 'consumed', NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:41'),
(402, 410, 48, 0.1000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 220.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(403, 410, 47, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 120.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(404, 411, 48, 0.1500, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 330.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:13:44', 'consumed', NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:44'),
(405, 411, 47, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 120.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:13:44', 'consumed', NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:44'),
(406, 412, 47, 0.3000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 120.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:16:54', 'consumed', NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:16:54'),
(407, 413, 48, 0.0300, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 66.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(408, 413, 46, 0.2000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 310.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(409, 413, 42, 10.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 1200.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(410, 413, 44, 0.5000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 76.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(411, 413, 41, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 7500.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(412, 414, 47, 0.5000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 200.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(413, 415, 47, 0.5000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 200.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 12:44:20', 'consumed', NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:44:20'),
(414, 416, 48, 0.0400, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 88.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:19:41', 'consumed', NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:41'),
(415, 416, 49, 0.3100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 697.50, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:19:41', 'consumed', NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:41'),
(416, 417, 47, 0.5100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 204.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:38:10', 'consumed', NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:38:10'),
(417, 418, 48, 0.0400, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 88.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:39:22', 'consumed', NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:22'),
(418, 418, 49, 0.3100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 697.50, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:39:22', 'consumed', NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:22'),
(419, 419, 49, 0.5100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 1147.50, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(420, 419, 48, 0.0400, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 88.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(421, 419, 41, 5.0100, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 7515.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(422, 419, 46, 0.2100, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 325.50, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(423, 420, 48, 0.0500, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 110.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:56:30', 'consumed', NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:30'),
(424, 420, 49, 0.3200, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 720.00, 0.00, 0.000, 0.00, NULL, NULL, '2025-07-28 13:56:30', 'consumed', NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:30');

-- --------------------------------------------------------

--
-- Table structure for table `production_material_usage`
--

CREATE TABLE `production_material_usage` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_material_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `material_batch_id` int(11) DEFAULT NULL,
  `usage_type` enum('consumption','waste','return','adjustment','transfer') DEFAULT 'consumption',
  `quantity_used` decimal(10,4) NOT NULL,
  `unit_used` varchar(50) NOT NULL,
  `containers_opened` int(11) DEFAULT 0,
  `pieces_consumed` int(11) DEFAULT 0,
  `base_unit_equivalent` decimal(10,4) DEFAULT NULL,
  `conversion_notes` text DEFAULT NULL,
  `batch_code` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(10,4) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `used_by` int(11) DEFAULT NULL,
  `usage_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_output`
--

CREATE TABLE `production_output` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `quantity_produced` int(11) NOT NULL,
  `quantity_passed_qc` int(11) DEFAULT 0,
  `quantity_failed_qc` int(11) DEFAULT 0,
  `quantity_rework` int(11) DEFAULT 0,
  `quality_score` decimal(5,2) DEFAULT NULL,
  `quality_grade` varchar(50) DEFAULT NULL,
  `defect_rate` decimal(5,2) DEFAULT NULL,
  `yield_percentage` decimal(5,2) DEFAULT NULL,
  `output_batch_code` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `shelf_life_days` int(11) DEFAULT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `material_cost` decimal(10,2) DEFAULT 0.00,
  `labor_cost` decimal(10,2) DEFAULT 0.00,
  `overhead_cost` decimal(10,2) DEFAULT 0.00,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `created_product_id` int(11) DEFAULT NULL,
  `created_batch_id` int(11) DEFAULT NULL,
  `cost_per_unit` decimal(10,4) DEFAULT 0.0000,
  `packaging_type` varchar(100) DEFAULT NULL,
  `packaging_date` date DEFAULT NULL,
  `storage_location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_output`
--

INSERT INTO `production_output` (`id`, `production_id`, `quantity_produced`, `quantity_passed_qc`, `quantity_failed_qc`, `quantity_rework`, `quality_score`, `quality_grade`, `defect_rate`, `yield_percentage`, `output_batch_code`, `expiration_date`, `shelf_life_days`, `manufacturing_date`, `material_cost`, `labor_cost`, `overhead_cost`, `total_cost`, `created_product_id`, `created_batch_id`, `cost_per_unit`, `packaging_type`, `packaging_date`, `storage_location`, `notes`, `created_at`, `updated_at`) VALUES
(278, 399, 70, 70, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280399', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 340, NULL, 0.0000, '', '0000-00-00', '', '', '2025-07-27 18:33:44', '2025-07-27 18:33:44'),
(279, 401, 5, 5, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280401', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 341, 390, 0.0000, '', '0000-00-00', '', '', '2025-07-27 21:38:14', '2025-07-27 21:38:14'),
(280, 402, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280402', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 342, 391, 0.0000, '', '0000-00-00', '', '', '2025-07-27 21:46:01', '2025-07-27 21:46:01'),
(281, 403, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280403', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 343, 392, 0.0000, '', '0000-00-00', '', '', '2025-07-27 21:50:48', '2025-07-27 21:50:48'),
(282, 404, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280404', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 344, 393, 0.0000, '', '0000-00-00', '', '', '2025-07-27 21:55:27', '2025-07-27 21:55:27'),
(283, 405, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280405', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 345, 394, 0.0000, '', '0000-00-00', '', '', '2025-07-27 21:59:13', '2025-07-27 21:59:13'),
(284, 406, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280406', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 346, 395, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:02:45', '2025-07-27 22:02:45'),
(285, 407, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280407', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 347, 396, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:05:14', '2025-07-27 22:05:14'),
(286, 408, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280408', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 348, 397, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:07:42', '2025-07-27 22:07:42'),
(287, 409, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280409', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 349, 398, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:09:41', '2025-07-27 22:09:41'),
(288, 411, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280411', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 350, 399, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:13:44', '2025-07-27 22:13:44'),
(289, 412, 30, 30, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280412', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 351, NULL, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:16:54', '2025-07-27 22:16:54'),
(290, 415, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280415', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 351, NULL, 0.0000, '', '0000-00-00', '', '', '2025-07-27 22:44:20', '2025-07-27 22:44:20'),
(291, 416, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280416', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 349, 400, 0.0000, '', '0000-00-00', '', '', '2025-07-27 23:19:41', '2025-07-27 23:19:41'),
(292, 417, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280417', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 351, NULL, 0.0000, '', '0000-00-00', '', '', '2025-07-27 23:38:10', '2025-07-27 23:38:10'),
(293, 418, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280418', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 347, 401, 0.0000, '', '0000-00-00', '', '', '2025-07-27 23:39:22', '2025-07-27 23:39:22'),
(294, 420, 50, 50, 0, 0, 95.00, 'A', 0.00, 100.00, 'OUT2507280420', '2025-09-28', 30, '2025-07-28', 0.00, 0.00, 0.00, 0.00, 349, 402, 0.0000, '', '0000-00-00', '', '', '2025-07-27 23:56:30', '2025-07-27 23:56:30');

-- --------------------------------------------------------

--
-- Table structure for table `production_quality_checks`
--

CREATE TABLE `production_quality_checks` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `check_type` enum('visual','measurement','chemical','microbiological','sensory','packaging','other') NOT NULL,
  `check_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `expected_value` varchar(255) DEFAULT NULL,
  `actual_value` varchar(255) DEFAULT NULL,
  `tolerance_min` varchar(100) DEFAULT NULL,
  `tolerance_max` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `pass_fail` enum('pass','fail','pending','na') DEFAULT 'pending',
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `checked_by` varchar(100) DEFAULT NULL,
  `checked_at` datetime DEFAULT current_timestamp(),
  `corrective_action` text DEFAULT NULL,
  `recheck_required` tinyint(1) DEFAULT 0,
  `recheck_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_recipes`
--

CREATE TABLE `production_recipes` (
  `id` int(11) NOT NULL,
  `recipe_id` varchar(50) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `recipe_name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `version` varchar(20) DEFAULT '1.0',
  `batch_size` int(11) NOT NULL DEFAULT 1,
  `estimated_duration_hours` int(11) DEFAULT 8,
  `difficulty_level` enum('easy','medium','hard','expert') DEFAULT 'medium',
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ingredients`)),
  `steps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`steps`)),
  `equipment_needed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`equipment_needed`)),
  `quality_standards` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`quality_standards`)),
  `testing_requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`testing_requirements`)),
  `cost_per_batch` decimal(10,2) DEFAULT 0.00,
  `yield_percentage` decimal(5,2) DEFAULT 100.00,
  `shelf_life_days` int(11) DEFAULT 365,
  `storage_requirements` text DEFAULT NULL,
  `allergen_info` text DEFAULT NULL,
  `status` enum('draft','active','inactive','archived','under-review') DEFAULT 'draft',
  `is_default` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_recipes`
--

INSERT INTO `production_recipes` (`id`, `recipe_id`, `product_id`, `recipe_name`, `category`, `version`, `batch_size`, `estimated_duration_hours`, `difficulty_level`, `ingredients`, `steps`, `equipment_needed`, `quality_standards`, `testing_requirements`, `cost_per_batch`, `yield_percentage`, `shelf_life_days`, `storage_requirements`, `allergen_info`, `status`, `is_default`, `description`, `notes`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'Default Jam Production', 'Preserves', '1.0', 12, 8, 'medium', '[{\"material_name\": \"Fruit\", \"quantity\": 2, \"unit\": \"kg\"}, {\"material_name\": \"Sugar\", \"quantity\": 1.5, \"unit\": \"kg\"}, {\"material_name\": \"Glass Jars\", \"quantity\": 12, \"unit\": \"pieces\"}]', '[{\"step\": 1, \"name\": \"Preparation\", \"description\": \"Wash and prepare fruits\", \"duration\": 30}, {\"step\": 2, \"name\": \"Cooking\", \"description\": \"Cook fruit with sugar\", \"duration\": 120}, {\"step\": 3, \"name\": \"Jarring\", \"description\": \"Fill jars and seal\", \"duration\": 45}, {\"step\": 4, \"name\": \"Quality Check\", \"description\": \"Check seals and quality\", \"duration\": 15}]', NULL, NULL, NULL, 0.00, 100.00, 365, NULL, NULL, 'active', 0, NULL, NULL, NULL, NULL, NULL, '2025-05-26 09:53:40', '2025-05-26 09:53:40'),
(2, NULL, NULL, 'Pineapple Jam Standard', 'Pineapple Jam', '1.0', 24, 8, 'medium', '[{\"material_name\": \"Fresh Pineapple\", \"quantity\": 3, \"unit\": \"kg\"}, {\"material_name\": \"Sugar\", \"quantity\": 2, \"unit\": \"kg\"}, {\"material_name\": \"Lemon Juice\", \"quantity\": 100, \"unit\": \"ml\"}, {\"material_name\": \"Glass Jars\", \"quantity\": 24, \"unit\": \"pieces\"}]', '[{\"step\": 1, \"name\": \"Fruit Preparation\", \"description\": \"Peel and dice pineapple\", \"duration\": 45}, {\"step\": 2, \"name\": \"Cooking\", \"description\": \"Cook pineapple with sugar and lemon\", \"duration\": 90}, {\"step\": 3, \"name\": \"Consistency Check\", \"description\": \"Test jam consistency\", \"duration\": 10}, {\"step\": 4, \"name\": \"Jarring\", \"description\": \"Fill sterilized jars\", \"duration\": 30}, {\"step\": 5, \"name\": \"Sealing\", \"description\": \"Seal and label jars\", \"duration\": 20}, {\"step\": 6, \"name\": \"Quality Control\", \"description\": \"Final quality inspection\", \"duration\": 15}]', NULL, NULL, NULL, 0.00, 100.00, 365, NULL, NULL, 'active', 0, NULL, NULL, NULL, NULL, NULL, '2025-05-26 09:53:40', '2025-05-26 09:53:40');

-- --------------------------------------------------------

--
-- Table structure for table `production_status_history`
--

CREATE TABLE `production_status_history` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `duration_in_previous_status` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_steps`
--

CREATE TABLE `production_steps` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `step_number` int(11) NOT NULL,
  `step_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in-progress','completed','skipped','failed','on-hold') DEFAULT 'pending',
  `estimated_duration_minutes` int(11) DEFAULT NULL,
  `actual_duration_minutes` int(11) DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `completed_by` int(11) DEFAULT NULL,
  `depends_on_step` int(11) DEFAULT NULL,
  `requires_quality_check` tinyint(1) DEFAULT 0,
  `quality_checked` tinyint(1) DEFAULT 0,
  `quality_notes` text DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `temperature_required` decimal(5,2) DEFAULT NULL,
  `pressure_required` decimal(5,2) DEFAULT NULL,
  `equipment_needed` text DEFAULT NULL,
  `safety_notes` text DEFAULT NULL,
  `quality_checkpoints` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_steps`
--

INSERT INTO `production_steps` (`id`, `production_id`, `step_number`, `step_name`, `description`, `status`, `estimated_duration_minutes`, `actual_duration_minutes`, `started_at`, `completed_at`, `assigned_to`, `completed_by`, `depends_on_step`, `requires_quality_check`, `quality_checked`, `quality_notes`, `instructions`, `temperature_required`, `pressure_required`, `equipment_needed`, `safety_notes`, `quality_checkpoints`, `notes`, `created_at`, `updated_at`) VALUES
(2365, 399, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(2366, 399, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(2367, 399, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(2368, 399, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(2369, 399, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(2370, 399, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(2371, 400, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(2372, 400, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(2373, 400, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(2374, 400, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(2375, 400, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(2376, 400, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(2377, 401, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:35:54', '2025-07-28 03:35:54'),
(2378, 401, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:35:54', '2025-07-28 03:35:54'),
(2379, 401, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:35:54', '2025-07-28 03:35:54'),
(2380, 401, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:35:54', '2025-07-28 03:35:54'),
(2381, 401, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:35:54', '2025-07-28 03:35:54'),
(2382, 401, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:35:54', '2025-07-28 03:35:54'),
(2383, 402, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(2384, 402, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(2385, 402, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(2386, 402, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(2387, 402, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(2388, 402, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(2389, 403, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:49:43', '2025-07-28 03:49:43'),
(2390, 403, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:49:43', '2025-07-28 03:49:43'),
(2391, 403, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:49:43', '2025-07-28 03:49:43'),
(2392, 403, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:49:43', '2025-07-28 03:49:43'),
(2393, 403, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:49:43', '2025-07-28 03:49:43'),
(2394, 403, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:49:43', '2025-07-28 03:49:43'),
(2395, 404, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(2396, 404, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(2397, 404, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(2398, 404, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(2399, 404, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(2400, 404, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(2401, 405, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(2402, 405, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(2403, 405, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(2404, 405, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(2405, 405, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(2406, 405, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(2407, 406, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:02:27', '2025-07-28 04:02:27'),
(2408, 406, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:02:27', '2025-07-28 04:02:27'),
(2409, 406, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:02:27', '2025-07-28 04:02:27'),
(2410, 406, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:02:27', '2025-07-28 04:02:27'),
(2411, 406, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:02:27', '2025-07-28 04:02:27'),
(2412, 406, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:02:27', '2025-07-28 04:02:27'),
(2413, 407, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:04:45', '2025-07-28 04:04:45'),
(2414, 407, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:04:46', '2025-07-28 04:04:46'),
(2415, 407, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:04:46', '2025-07-28 04:04:46'),
(2416, 407, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:04:46', '2025-07-28 04:04:46'),
(2417, 407, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:04:46', '2025-07-28 04:04:46'),
(2418, 407, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:04:46', '2025-07-28 04:04:46'),
(2419, 408, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(2420, 408, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(2421, 408, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(2422, 408, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(2423, 408, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(2424, 408, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(2425, 409, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(2426, 409, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(2427, 409, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(2428, 409, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(2429, 409, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(2430, 409, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(2431, 410, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(2432, 410, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(2433, 410, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(2434, 410, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(2435, 410, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(2436, 410, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(2437, 411, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(2438, 411, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(2439, 411, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(2440, 411, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(2441, 411, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(2442, 411, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(2443, 412, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:15:59'),
(2444, 412, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:15:59'),
(2445, 412, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:15:59'),
(2446, 412, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:15:59'),
(2447, 412, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:15:59'),
(2448, 412, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:15:59', '2025-07-28 04:15:59'),
(2449, 413, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(2450, 413, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(2451, 413, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(2452, 413, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(2453, 413, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(2454, 413, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:18:58', '2025-07-28 04:18:58'),
(2455, 414, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(2456, 414, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(2457, 414, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(2458, 414, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(2459, 414, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(2460, 414, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:41:56', '2025-07-28 04:41:56'),
(2461, 415, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:43:52'),
(2462, 415, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:43:52'),
(2463, 415, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:43:52'),
(2464, 415, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:43:52'),
(2465, 415, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:43:52'),
(2466, 415, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 04:43:52', '2025-07-28 04:43:52'),
(2467, 416, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:12'),
(2468, 416, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:12'),
(2469, 416, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:12'),
(2470, 416, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:12'),
(2471, 416, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:12'),
(2472, 416, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:19:12', '2025-07-28 05:19:12'),
(2473, 417, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:37:42'),
(2474, 417, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:37:42'),
(2475, 417, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:37:42'),
(2476, 417, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:37:42'),
(2477, 417, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:37:42'),
(2478, 417, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:37:42', '2025-07-28 05:37:42'),
(2479, 418, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:12'),
(2480, 418, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:12'),
(2481, 418, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:12'),
(2482, 418, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:12'),
(2483, 418, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:12'),
(2484, 418, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:39:12', '2025-07-28 05:39:12'),
(2485, 419, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(2486, 419, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(2487, 419, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(2488, 419, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(2489, 419, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(2490, 419, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:53:09', '2025-07-28 05:53:09'),
(2491, 420, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:14'),
(2492, 420, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:14'),
(2493, 420, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:14'),
(2494, 420, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:14'),
(2495, 420, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:14'),
(2496, 420, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-28 05:56:14', '2025-07-28 05:56:14');

-- --------------------------------------------------------

--
-- Table structure for table `production_waste`
--

CREATE TABLE `production_waste` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `waste_type` enum('material','product','packaging','energy','time') NOT NULL,
  `waste_category` enum('normal','defective','expired','damaged','spillage','overproduction') NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `cost_impact` decimal(10,2) DEFAULT 0.00,
  `cause` varchar(255) DEFAULT NULL,
  `prevention_action` text DEFAULT NULL,
  `disposal_method` varchar(255) DEFAULT NULL,
  `environmental_impact` text DEFAULT NULL,
  `recorded_by` varchar(255) DEFAULT NULL,
  `recorded_at` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_photo` varchar(255) DEFAULT NULL,
  `product_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `stocks` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `expiration_date` date NOT NULL,
  `batch_tracking` tinyint(1) DEFAULT 1,
  `status` enum('In Stock','Low Stock','Out of Stock') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_from_production` tinyint(1) DEFAULT 0,
  `production_reference` varchar(50) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `slug`, `product_id`, `product_photo`, `product_name`, `category`, `stocks`, `price`, `expiration_date`, `batch_tracking`, `status`, `created_at`, `updated_at`, `created_from_production`, `production_reference`, `created_by`) VALUES
(340, 'pina-dishwashing', 'DT778014', 'uploads/product_68871e6c857bf.png', 'Piña Dishwashing Soap Small', 'Detergent', 11, 40.00, '2025-09-28', 0, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:53:32', 127, '399', 0),
(341, 'pina-pie', 'SN193806', 'uploads/product_68871e9153466.png', 'Pina Pie', 'Snacks', 5, 180.00, '2025-09-28', 1, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:54:09', 127, '401', 0),
(342, 'pina-bars', 'SN929962', 'uploads/product_68871e5dc0b93.png', 'Pina Bars Pouch', 'Snacks', 18, 130.00, '2025-09-28', 1, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:53:17', 127, '402', 0),
(343, 'pina-bars', 'SN389250', 'uploads/product_68871e5394824.png', 'Pina Bars Box', 'Snacks', 19, 180.00, '2025-09-28', 1, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:53:07', 127, '403', 0),
(344, 'pina-putoseko', 'SN679699', 'uploads/product_68871e441a4ea.png', 'Pina Putoseko', 'Snacks', 30, 50.00, '2025-09-28', 1, 'In Stock', '0000-00-00 00:00:00', '2025-07-28 06:52:52', 127, '404', 0),
(345, 'pina-ube', 'SN945200', 'uploads/product_68871e386966a.png', 'Pina Ube Bars', 'Snacks', 23, 140.00, '2025-09-28', 1, 'In Stock', '0000-00-00 00:00:00', '2025-07-28 06:52:40', 127, '405', 0),
(346, 'pina-champoy', 'PR175874', 'uploads/product_68871e2cddffc.png', 'Pina Champoy', 'Preserves', 30, 85.50, '2025-09-28', 1, 'In Stock', '0000-00-00 00:00:00', '2025-07-28 06:52:28', 127, '406', 0),
(347, 'pina-tuyo', 'PR381938', 'uploads/product_68871e1be3a5f.png', 'Pina Tuyo', 'Preserves', 10, 180.00, '2025-09-28', 1, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:52:11', 127, '407', 0),
(348, 'pina-tinapa', 'PR529195', 'uploads/product_68871e0e0669f.png', 'Pina Tinapa', 'Preserves', 30, 180.00, '2025-09-28', 1, 'In Stock', '0000-00-00 00:00:00', '2025-07-28 06:51:58', 127, '408', 0),
(349, 'pina-mangga', 'PR685989', 'uploads/product_68871e00ee31c.png', 'Pina Mangga', 'Preserves', 15, 95.00, '2025-09-28', 1, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:51:44', 127, '409', 0),
(350, 'pina-concentrate', 'BV954207', 'uploads/product_68871df463656.png', 'Pina Concentrate', 'Beverages', 0, 130.00, '2025-09-28', 1, 'Out of Stock', '0000-00-00 00:00:00', '2025-07-28 06:51:32', 127, '411', 0),
(351, 'pina-dishwashing', 'DT111109', 'uploads/product_68871de1ae295.png', 'Piña Dishwashing Soap Large', 'Detergent', 20, 60.00, '2025-09-28', 0, 'Low Stock', '0000-00-00 00:00:00', '2025-07-28 06:51:13', 127, '412', 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_batches`
--

CREATE TABLE `product_batches` (
  `batch_id` int(11) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `expiration_date` date NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `custom_duration_days` int(11) DEFAULT NULL,
  `expiration_duration` varchar(10) DEFAULT NULL,
  `custom_duration_value` int(11) DEFAULT NULL,
  `custom_duration_unit` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_batches`
--

INSERT INTO `product_batches` (`batch_id`, `product_id`, `batch_code`, `quantity`, `expiration_date`, `manufacturing_date`, `unit_cost`, `created_at`, `updated_at`, `custom_duration_days`, `expiration_duration`, `custom_duration_value`, `custom_duration_unit`) VALUES
(136, 'P012', '20250324-218', 20, '2025-05-23', '2025-03-23', 0.00, '2025-03-24 04:44:26', '2025-03-24 04:44:26', NULL, NULL, NULL, NULL),
(166, 'P021', '20250324-982', 30, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:19:32', '2025-03-24 23:19:32', NULL, NULL, NULL, NULL),
(169, 'P021', '20250324-849', 10, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:36:34', '2025-03-24 23:36:34', NULL, NULL, NULL, NULL),
(170, 'P021', '20250324-849', 10, '2025-05-24', '0000-00-00', 0.00, '2025-03-24 23:36:34', '2025-03-25 18:26:05', NULL, NULL, NULL, NULL),
(171, 'P021', '20250324-849', 10, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:36:34', '2025-03-24 23:36:34', NULL, NULL, NULL, NULL),
(172, 'P021', '20250324-473', 52, '2025-05-24', '0000-00-00', 0.00, '2025-03-24 23:38:02', '2025-03-25 19:03:19', NULL, NULL, NULL, NULL),
(174, 'P023', '20250324-125', 50, '2025-05-25', '0000-00-00', 0.00, '2025-03-24 23:39:59', '2025-03-25 19:01:42', NULL, NULL, NULL, NULL),
(175, 'P023', '20250324-904', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-24 23:40:11', '2025-03-25 18:47:30', NULL, NULL, NULL, NULL),
(176, 'P025', '20250324-015', 50, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:41:44', '2025-03-24 23:41:44', NULL, NULL, NULL, NULL),
(177, 'P023', '20250325-572', 15, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 00:14:11', '2025-03-25 18:24:49', NULL, NULL, NULL, NULL),
(178, 'P023', '20250325-762', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 17:59:47', '2025-03-25 18:19:53', NULL, NULL, NULL, NULL),
(179, 'P023', '20250325-762', 21, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 17:59:47', '2025-03-25 17:59:47', NULL, NULL, NULL, NULL),
(180, 'P023', '20250325-695', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 18:32:43', '2025-03-25 18:32:43', NULL, NULL, NULL, NULL),
(186, 'P021', '20250325-320', 100, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:03:31', '2025-03-25 19:03:31', NULL, NULL, NULL, NULL),
(188, 'P027', '20250325-309', 51, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:33', '2025-03-25 22:15:21', NULL, NULL, NULL, NULL),
(189, 'P027', '20250325-862', 30, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:56', '2025-03-25 20:04:19', NULL, NULL, NULL, NULL),
(190, 'P027', '20250325-862', 32, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:56', '2025-03-25 20:18:22', NULL, NULL, NULL, NULL),
(200, 'P027', '20250325-709', 10, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 20:19:29', '2025-03-25 20:19:49', NULL, NULL, NULL, NULL),
(203, 'P027', '20250325-305', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 23:17:55', '2025-03-25 23:17:55', NULL, NULL, NULL, NULL),
(251, 'P029', '20250329-959', 2, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:56:37', '2025-05-03 14:03:24', NULL, NULL, NULL, NULL),
(252, 'P030', '20250329-563', 9, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:57:17', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(253, 'P031', '20250329-320', 0, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:57:59', '2025-03-31 08:54:06', NULL, NULL, NULL, NULL),
(255, 'P033', '20250329-619', 0, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:59:05', '2025-05-03 14:18:30', NULL, NULL, NULL, NULL),
(256, 'P035', '20250329-514', 22, '2025-05-29', '2025-03-29', 0.00, '2025-03-29 12:59:27', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(257, 'P036', '20250329-067', 0, '2025-05-29', '2025-03-29', 0.00, '2025-03-29 13:00:03', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(258, 'P033', '20250329-408', 0, '2025-05-29', '0000-00-00', 0.00, '2025-03-29 23:06:02', '2025-07-20 13:29:28', NULL, '', NULL, NULL),
(268, 'P031', '20250331-062', 18, '2025-05-31', '0000-00-00', 0.00, '2025-03-31 08:53:09', '2025-05-26 19:29:36', NULL, '', NULL, NULL),
(269, 'P036', '20250411-703', 54, '2025-06-11', '0000-00-00', 0.00, '2025-04-11 20:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(270, 'P036', '20250412-098', 55, '2025-06-12', '0000-00-00', 0.00, '2025-04-12 14:57:14', '2025-04-21 06:37:00', NULL, NULL, NULL, NULL),
(275, 'P035', '20250425-421', 12, '2025-09-25', '0000-00-00', 0.00, '2025-04-25 17:58:16', '2025-04-25 17:58:16', NULL, '5m', NULL, NULL),
(287, 'TEST_BATCH_001', '20250712-366', 95, '2024-12-31', '0000-00-00', 1.75, '0000-00-00 00:00:00', '2024-01-01 10:00:00', NULL, NULL, NULL, NULL),
(291, 'P030', '20250713-724', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(292, 'P029', '20250713-985', 11, '2025-09-14', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-15 00:46:21', NULL, '', NULL, NULL),
(293, 'P035', '20250713-710', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(294, 'P029', '20250713-078', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(295, 'P033', '20250713-615', 1, '2025-09-20', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, '', NULL, NULL),
(297, 'P031', '20250713-958', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(298, 'P029', '20250714-391', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(299, 'P029', '20250714-892', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(300, 'P031', '20250715-046', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(304, 'BE529771', 'B1752582529771', 4, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-15 14:28:49', NULL, NULL, NULL, NULL),
(305, 'BE529771', 'B1752582582442', 6, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-15 14:29:42', NULL, NULL, NULL, NULL),
(307, 'P035', 'B1752595357425', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(312, 'P029', 'B1752683918342', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(313, 'P029', 'B1752685360534', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(315, 'P033', '', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(316, 'SN389939', '', 2, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-17 15:53:09', NULL, NULL, NULL, NULL),
(317, 'PR070232', '', 10, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-17 16:04:30', NULL, NULL, NULL, NULL),
(318, 'BE749130', '', 20, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-17 16:15:49', NULL, NULL, NULL, NULL),
(319, 'P031', '', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(320, 'P035', '', 0, '0000-00-00', '0000-00-00', 0.00, '0000-00-00 00:00:00', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(321, 'P033', '', 0, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 16:33:01', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(322, 'P031', '', 0, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 16:43:14', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(323, 'P029', '', 0, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 16:47:50', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(324, 'P029', '', 0, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 17:01:03', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(325, 'PR535947', '', 4, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 17:02:15', '2025-07-17 17:02:15', NULL, NULL, NULL, NULL),
(326, 'BE892550', '', 4, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 17:08:12', '2025-07-17 17:08:12', NULL, NULL, NULL, NULL),
(327, 'PR450816', '', 4, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 17:17:30', '2025-07-17 17:17:30', NULL, NULL, NULL, NULL),
(328, 'P029', '', 3, '0000-00-00', '2025-07-17', 0.00, '2025-07-17 17:21:48', '2025-07-20 13:29:28', NULL, NULL, NULL, NULL),
(329, 'BE663774', 'B1752766655489', 4, '2025-09-17', '2025-07-17', 0.00, '2025-07-17 17:37:43', '2025-07-17 17:37:43', NULL, NULL, NULL, NULL),
(330, 'P029', 'B1752766758175', 4, '2025-09-17', '2025-07-17', 0.00, '2025-07-17 17:39:23', '2025-07-17 17:39:23', NULL, NULL, NULL, NULL),
(331, 'PR784037', 'B1752768779026', 3, '2025-09-17', '2025-07-17', 0.00, '2025-07-17 18:13:04', '2025-07-17 18:13:04', NULL, NULL, NULL, NULL),
(333, 'P029', 'B1752779150054', 4, '2025-09-17', '2025-07-17', 0.00, '2025-07-17 21:05:51', '2025-07-17 21:05:51', NULL, NULL, NULL, NULL),
(342, 'BE107755', 'B1752922103729', 0, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 12:48:27', '2025-07-20 23:18:01', NULL, NULL, NULL, NULL),
(343, 'BE107755', 'B1752924576049', 0, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 13:29:40', '2025-07-20 23:18:01', NULL, NULL, NULL, NULL),
(345, 'BE107755', 'B1752947690107', 20, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 19:54:56', '2025-07-20 23:18:01', NULL, NULL, NULL, NULL),
(350, 'SN168120', 'B1752952163423', 32, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 21:09:28', '2025-07-19 21:09:28', NULL, NULL, NULL, NULL),
(351, 'BE704068', 'B1752952697186', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 21:18:24', '2025-07-19 21:18:24', NULL, NULL, NULL, NULL),
(352, 'BE364344', 'B1752953359487', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 21:29:24', '2025-07-19 21:29:24', NULL, NULL, NULL, NULL),
(353, 'PR020936', 'B1752954014742', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 21:40:20', '2025-07-19 21:40:20', NULL, NULL, NULL, NULL),
(354, 'PR098319', 'B1752954091525', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 21:41:38', '2025-07-19 21:41:38', NULL, NULL, NULL, NULL),
(355, 'SN880480', 'B1752956873667', 12, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 22:28:00', '2025-07-19 22:28:00', NULL, NULL, NULL, NULL),
(356, 'BE916142', 'B1752957908820', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 22:45:16', '2025-07-19 22:45:16', NULL, NULL, NULL, NULL),
(357, 'BE916142', 'B1752957953607', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 22:46:09', '2025-07-19 22:46:09', NULL, NULL, NULL, NULL),
(358, 'PR098319', 'B1752958911575', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 23:01:59', '2025-07-19 23:01:59', NULL, NULL, NULL, NULL),
(359, 'PR098319', 'B1752959923374', 4, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 23:18:49', '2025-07-19 23:18:49', NULL, NULL, NULL, NULL),
(360, 'BE149283', 'B1752961140355', 5, '2025-09-19', '2025-07-19', 0.00, '2025-07-19 23:39:09', '2025-07-19 23:39:09', NULL, NULL, NULL, NULL),
(361, 'P029', 'B1752986954208', 7, '2025-09-19', '2025-07-19', 0.00, '2025-07-20 06:53:24', '2025-07-20 06:53:24', NULL, NULL, NULL, NULL),
(363, 'PR892812', 'B1752988878809', 10, '2025-09-20', '2025-07-20', 0.00, '2025-07-20 07:21:32', '2025-07-20 07:21:32', NULL, NULL, NULL, NULL),
(389, 'P031', 'B1753620058233', 3, '2025-09-27', '2025-07-27', 0.00, '2025-07-27 14:41:03', '2025-07-27 14:41:03', NULL, NULL, NULL, NULL),
(390, 'SN193806', 'B1753673795134', 5, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 05:38:14', '2025-07-28 05:38:14', NULL, NULL, NULL, NULL),
(391, 'SN929962', 'B1753674299438', 18, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 05:46:01', '2025-07-28 14:05:30', NULL, NULL, NULL, NULL),
(392, 'SN389250', 'B1753674592230', 19, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 05:50:48', '2025-07-28 14:06:13', NULL, NULL, NULL, NULL),
(393, 'SN679699', 'B1753674875193', 30, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 05:55:27', '2025-07-28 05:55:27', NULL, NULL, NULL, NULL),
(394, 'SN945200', 'B1753675142317', 23, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 05:59:13', '2025-07-28 14:04:00', NULL, NULL, NULL, NULL),
(395, 'PR175874', 'B1753675356062', 30, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 06:02:45', '2025-07-28 06:02:45', NULL, NULL, NULL, NULL),
(396, 'PR381938', 'B1753675500476', 0, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 06:05:14', '2025-07-28 13:40:45', NULL, NULL, NULL, NULL),
(397, 'PR529195', 'B1753675644448', 30, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 06:07:42', '2025-07-28 06:07:42', NULL, NULL, NULL, NULL),
(398, 'PR685989', 'B1753675774976', 0, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 06:09:41', '2025-07-28 13:20:54', NULL, NULL, NULL, NULL),
(399, 'BV954207', 'B1753676022433', 0, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 06:13:44', '2025-07-28 14:01:39', NULL, NULL, NULL, NULL),
(400, 'PR685989', 'B1753679960051', 0, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 07:19:41', '2025-07-28 13:57:45', NULL, NULL, NULL, NULL),
(401, 'PR381938', 'B1753681161041', 10, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 07:39:22', '2025-07-28 13:57:45', NULL, NULL, NULL, NULL),
(402, 'PR685989', 'B1753682184598', 15, '2025-09-28', '2025-07-28', 0.00, '2025-07-28 07:56:30', '2025-07-28 14:04:00', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_price_history`
--

CREATE TABLE `product_price_history` (
  `history_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `retailer_id` int(11) NOT NULL,
  `previous_price` decimal(10,2) NOT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_pricing`
--

CREATE TABLE `product_pricing` (
  `pricing_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `retailer_id` int(11) NOT NULL,
  `retail_price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quality_checkpoints`
--

CREATE TABLE `quality_checkpoints` (
  `id` int(11) NOT NULL,
  `checkpoint_id` varchar(50) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `checkpoint_name` varchar(255) NOT NULL,
  `checkpoint_type` enum('visual','measurement','test','sample') DEFAULT 'visual',
  `parameter_name` varchar(255) NOT NULL,
  `target_value` varchar(100) DEFAULT NULL,
  `tolerance_min` varchar(100) DEFAULT NULL,
  `tolerance_max` varchar(100) DEFAULT NULL,
  `actual_value` varchar(100) DEFAULT NULL,
  `unit_of_measure` varchar(50) DEFAULT NULL,
  `status` enum('pending','passed','failed','skipped') DEFAULT 'pending',
  `inspector` varchar(255) DEFAULT NULL,
  `inspection_date` datetime DEFAULT NULL,
  `equipment_used` varchar(255) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `corrective_action` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `raw_materials`
--

CREATE TABLE `raw_materials` (
  `id` int(11) NOT NULL,
  `material_id` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `measurement_type` varchar(20) NOT NULL,
  `unit_measurement` varchar(20) DEFAULT NULL,
  `base_unit` varchar(50) DEFAULT NULL,
  `pieces_per_container` int(11) DEFAULT NULL,
  `pieces_total_unit_measurement` int(11) DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `is_alternative_supplier` enum('yes','no') DEFAULT 'no',
  `alternative_supplier` varchar(255) DEFAULT NULL,
  `date_received` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `receipt_file` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `container_status` enum('unopened','opened','mixed') DEFAULT 'unopened',
  `opened_containers` int(11) DEFAULT 0,
  `remaining_in_opened` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raw_materials`
--

INSERT INTO `raw_materials` (`id`, `material_id`, `name`, `category`, `quantity`, `measurement_type`, `unit_measurement`, `base_unit`, `pieces_per_container`, `pieces_total_unit_measurement`, `cost`, `supplier_id`, `is_alternative_supplier`, `alternative_supplier`, `date_received`, `expiry_date`, `receipt_file`, `notes`, `created_at`, `updated_at`, `container_status`, `opened_containers`, `remaining_in_opened`) VALUES
(41, 'M019', 'Flour', 'Ingredients', 12.99, 'Unit', 'kg', 'g', 0, NULL, 1500.00, 26, 'no', NULL, '2025-06-20', '2026-03-21', NULL, '', '2025-07-27 16:34:03', '2025-07-28 05:53:09', 'unopened', 0, 0.000),
(42, 'M020', 'Butter', 'Ingredients', 422.00, 'Unit', 'g', 'g', 0, NULL, 120.00, 26, 'no', NULL, '2025-06-20', '2026-03-21', NULL, '', '2025-07-27 16:38:03', '2025-07-28 04:18:58', 'unopened', 0, 0.000),
(43, 'M021', 'Cornstarch', 'Ingredients', 23.00, 'Unit', 'kg', 'g', 0, NULL, 1120.00, 26, 'no', NULL, '2025-06-20', '2027-03-18', NULL, '', '2025-07-27 16:40:55', '2025-07-28 03:54:26', 'unopened', 0, 0.000),
(44, 'M022', 'Sugar', 'Ingredients', -0.50, 'Unit', 'kg', 'g', 0, NULL, 152.00, 26, 'no', NULL, '2025-06-20', '2027-07-23', NULL, '', '2025-07-27 16:44:28', '2025-07-28 04:18:58', 'unopened', 0, 0.000),
(45, 'M023', 'Lards', 'Additives', 2.00, 'Unit', 'kg', 'g', 0, NULL, 1500.00, 26, 'no', NULL, '2025-06-20', '2025-12-31', NULL, 'Unopened lard can last up to a year in the pantry, or even longer in the refrigerator or freezer. Once opened, it\'s best used within six months from the pantry or a year if refrigerated.', '2025-07-27 16:49:01', '2025-07-27 16:49:01', 'unopened', 0, 0.000),
(46, 'M024', 'Egg', 'Ingredients', 148.84, 'Pieces', NULL, 'pieces', 0, NULL, 1550.00, 26, 'no', NULL, '2025-06-20', NULL, NULL, '', '2025-07-27 16:52:51', '2025-07-28 05:53:09', 'unopened', 0, 0.000),
(47, 'M025', 'Bottles (s M7177)', 'Packaging', 97.59, 'Pieces', NULL, 'pieces', 0, NULL, 400.00, 27, 'no', NULL, '2025-06-29', NULL, NULL, '', '2025-07-27 16:57:42', '2025-07-28 05:37:42', 'unopened', 0, 0.000),
(48, 'M026', 'Pineapple', 'Fruits', 18.05, 'Pieces', NULL, 'pieces', 0, NULL, 2200.00, 0, 'no', NULL, '2025-05-30', '2025-08-02', NULL, '', '2025-07-27 17:11:28', '2025-07-28 05:56:14', 'unopened', 0, 0.000),
(49, 'M027', 'Pouches', 'Packaging', 46.55, 'Pieces', NULL, 'pieces', 0, NULL, 2250.00, 28, 'no', NULL, '2025-06-18', NULL, NULL, '', '2025-07-27 17:17:17', '2025-07-28 05:56:14', 'unopened', 0, 0.000),
(50, 'M028', 'Pineapple', 'Fruits', 1.00, 'Box', NULL, 'pieces', 12, NULL, 1.00, 0, '', NULL, '2025-07-27', '2025-07-28', NULL, '', '2025-07-28 07:19:31', '2025-07-28 07:21:17', 'unopened', 0, 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `recipe_name` varchar(255) NOT NULL,
  `recipe_description` text DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`id`, `product_id`, `recipe_name`, `recipe_description`, `total_cost`, `created_at`, `updated_at`) VALUES
(1, 1, 'Test Recipe', 'This is a test recipe', 0.00, '2025-07-13 17:30:12', '2025-07-13 17:30:12'),
(2, 55, 'pleasee Recipe', 'Standard recipe for pleasee', 5100.00, '2025-07-13 18:00:27', '2025-07-13 18:00:27'),
(3, 56, 'hehe Recipe', 'Standard recipe for hehe', 2500.00, '2025-07-13 18:34:07', '2025-07-13 18:34:07'),
(4, 57, 'hayst Recipe', 'Standard recipe for hayst', 500.00, '2025-07-13 18:47:58', '2025-07-13 18:47:58'),
(5, 58, 'efw Recipe', 'Standard recipe for efw', 1500.00, '2025-07-13 18:52:20', '2025-07-13 18:52:20'),
(6, 59, 'wehq Recipe', 'Standard recipe for wehq', 1500.00, '2025-07-13 18:55:09', '2025-07-13 18:55:09'),
(7, 60, 'wefwq Recipe', 'Standard recipe for wefwq', 2500.00, '2025-07-13 18:57:43', '2025-07-13 18:57:43'),
(8, 61, 'normal Recipe', 'Standard recipe for normal', 2000.00, '2025-07-13 19:06:04', '2025-07-13 19:06:04'),
(9, 68, 'batch Recipe', 'Standard recipe for batch', 2500.00, '2025-07-13 19:50:33', '2025-07-13 19:50:33'),
(10, 69, 'batch tracked Recipe', 'Standard recipe for batch tracked', 2000.00, '2025-07-13 19:54:22', '2025-07-13 19:54:22'),
(11, 70, 'batches Recipe', 'Standard recipe for batches', 2000.00, '2025-07-13 19:57:53', '2025-07-13 19:57:53'),
(12, 71, 'ew Recipe', 'Standard recipe for ew', 2500.00, '2025-07-13 20:03:51', '2025-07-13 20:03:51'),
(13, 72, 'wed Recipe', 'Standard recipe for wed', 2500.00, '2025-07-13 20:05:18', '2025-07-13 20:05:18'),
(14, 73, 'thurs Recipe', 'Standard recipe for thurs', 2500.00, '2025-07-13 20:10:44', '2025-07-13 20:10:44'),
(15, 74, 'efqf Recipe', 'Standard recipe for efqf', 3000.00, '2025-07-13 20:18:06', '2025-07-13 20:18:06'),
(16, 75, 'eto yon Recipe', 'Standard recipe for eto yon', 2500.00, '2025-07-13 20:19:37', '2025-07-13 20:19:37'),
(17, 76, 'norm Recipe', 'Standard recipe for norm', 2500.00, '2025-07-13 20:29:39', '2025-07-13 20:29:39'),
(18, 77, 'price Recipe', 'Standard recipe for price', 2510.00, '2025-07-14 14:39:09', '2025-07-14 14:39:09'),
(19, 78, 'wte Recipe', 'Standard recipe for wte', 3000.00, '2025-07-14 15:16:37', '2025-07-14 15:16:37'),
(20, 79, 'jdsfh Recipe', 'Standard recipe for jdsfh', 3000.00, '2025-07-14 15:19:23', '2025-07-14 15:19:23'),
(21, 80, 'wefe Recipe', 'Standard recipe for wefe', 100.00, '2025-07-14 15:21:21', '2025-07-14 15:21:21'),
(22, 81, 'review Recipe', 'Standard recipe for review', 500.00, '2025-07-14 15:27:21', '2025-07-14 15:27:21'),
(23, 82, 'Progress Bar Recipe', 'Standard recipe for Progress Bar', 3000.00, '2025-07-14 15:33:21', '2025-07-14 15:33:21'),
(24, 83, 'progress Recipe', 'Standard recipe for progress', 2000.00, '2025-07-14 15:38:10', '2025-07-14 15:38:10'),
(25, 84, 'dwd Recipe', 'Standard recipe for dwd', 2500.00, '2025-07-14 15:40:54', '2025-07-14 15:40:54'),
(26, 85, 'wqr Recipe', 'Standard recipe for wqr', 3000.00, '2025-07-14 15:45:04', '2025-07-14 15:45:04'),
(27, 86, 'ede Recipe', 'Standard recipe for ede', 2500.00, '2025-07-14 15:46:09', '2025-07-14 15:46:09'),
(28, 87, 'dsfw Recipe', 'Standard recipe for dsfw', 3000.00, '2025-07-14 15:59:46', '2025-07-14 15:59:46'),
(29, 88, 'pagod naaa Recipe', 'Standard recipe for pagod naaa', 3000.00, '2025-07-14 16:08:34', '2025-07-14 16:08:34'),
(30, 89, 'first Recipe', 'Standard recipe for first', 3500.00, '2025-07-14 16:20:58', '2025-07-14 16:20:58'),
(31, 90, 'progress Recipe', 'Standard recipe for progress', 2500.00, '2025-07-14 16:38:15', '2025-07-14 16:38:15'),
(32, 94, 'batch Recipe', 'Standard recipe for batch', 3000.00, '2025-07-14 17:19:45', '2025-07-14 17:19:45'),
(33, 95, 'chips Recipe', 'Standard recipe for chips', 3500.00, '2025-07-14 17:36:35', '2025-07-14 17:36:35'),
(34, 96, 'Coffee Recipe', 'Standard recipe for Coffee', 3500.00, '2025-07-14 17:50:02', '2025-07-14 17:50:02'),
(35, 97, 'Hotdog Recipe', 'Standard recipe for Hotdog', 2000.00, '2025-07-14 17:51:32', '2025-07-14 17:51:32'),
(36, 98, 'batched Recipe', 'Standard recipe for batched', 2500.00, '2025-07-14 18:03:22', '2025-07-14 18:03:22'),
(37, 99, 'fsaf Recipe', 'Standard recipe for fsaf', 500.00, '2025-07-14 18:04:54', '2025-07-14 18:04:54'),
(38, 100, 'djha Recipe', 'Standard recipe for djha', 2500.00, '2025-07-14 18:11:04', '2025-07-14 18:11:04'),
(39, 101, 'Awa nalanggg Recipe', 'Standard recipe for Awa nalanggg', 2620.00, '2025-07-14 18:24:37', '2025-07-14 18:24:37'),
(40, 102, 'ff Recipe', 'Standard recipe for ff', 2500.00, '2025-07-14 18:27:02', '2025-07-14 18:27:02'),
(41, 103, 'wef Recipe', 'Standard recipe for wef', 2000.00, '2025-07-14 18:35:07', '2025-07-14 18:35:07'),
(42, 104, 'wegwqf Recipe', 'Standard recipe for wegwqf', 500.00, '2025-07-14 18:38:31', '2025-07-14 18:38:31'),
(43, 105, 'fw Recipe', 'Standard recipe for fw', 5.00, '2025-07-14 19:34:05', '2025-07-14 19:34:05'),
(44, 106, 'visual Recipe', 'Standard recipe for visual', 3000.00, '2025-07-14 19:39:04', '2025-07-14 19:39:04'),
(45, 107, 'sdwq Recipe', 'Standard recipe for sdwq', 500.00, '2025-07-15 08:17:21', '2025-07-15 08:17:21'),
(46, 108, 'dafuq Recipe', 'Standard recipe for dafuq', 2000.00, '2025-07-15 08:18:12', '2025-07-15 08:18:12'),
(47, 109, 'awa nalang talaga Recipe', 'Standard recipe for awa nalang talaga', 2500.00, '2025-07-15 08:29:56', '2025-07-15 08:29:56'),
(48, 110, 'asda Recipe', 'Standard recipe for asda', 500.00, '2025-07-15 08:52:13', '2025-07-15 08:52:13'),
(49, 111, 'few Recipe', 'Standard recipe for few', 200.00, '2025-07-15 09:01:30', '2025-07-15 09:01:30'),
(50, 113, 'sa Recipe', 'Standard recipe for sa', 400.00, '2025-07-15 09:59:28', '2025-07-15 09:59:28'),
(51, 114, 'geff Recipe', 'Standard recipe for geff', 500.00, '2025-07-15 10:11:39', '2025-07-15 10:11:39'),
(52, 115, 'wwqd Recipe', 'Standard recipe for wwqd', 1000.00, '2025-07-15 10:24:25', '2025-07-15 10:24:25'),
(53, 116, 'df Recipe', 'Standard recipe for df', 500.00, '2025-07-15 10:44:09', '2025-07-15 10:44:09'),
(54, 117, 'ef Recipe', 'Standard recipe for ef', 2500.00, '2025-07-15 10:45:12', '2025-07-15 10:45:12'),
(55, 118, 'efds Recipe', 'Standard recipe for efds', 1000.00, '2025-07-15 10:54:19', '2025-07-15 10:54:19'),
(56, 120, 'finallyyy Recipe', 'Standard recipe for finallyyy', 1000.00, '2025-07-15 11:35:27', '2025-07-15 11:35:27'),
(57, 121, 'overdue Recipe', 'Standard recipe for overdue', 2500.00, '2025-07-15 12:00:25', '2025-07-15 12:00:25'),
(58, 122, 'gabriella Recipe', 'Standard recipe for gabriella', 1000.00, '2025-07-15 12:19:55', '2025-07-15 12:19:55'),
(59, 123, 'SQD Recipe', 'Standard recipe for SQD', 1000.00, '2025-07-15 12:22:53', '2025-07-15 12:22:53'),
(60, 124, 'Normal Track Recipe', 'Standard recipe for Normal Track', 2000.00, '2025-07-15 12:27:18', '2025-07-15 12:27:18'),
(61, 125, 'Batch Track Recipe', 'Standard recipe for Batch Track', 2000.00, '2025-07-15 12:28:38', '2025-07-15 12:28:38'),
(62, 141, 'is Recipe', 'Standard recipe for is', 2500.00, '2025-07-15 18:51:54', '2025-07-15 18:51:54'),
(63, 143, 'efwf Recipe', 'Standard recipe for efwf', 2000.00, '2025-07-15 19:24:28', '2025-07-15 19:24:28'),
(64, 148, 'wd Recipe', 'Standard recipe for wd', 2000.00, '2025-07-15 19:58:29', '2025-07-15 19:58:29'),
(65, 150, 'dhja Recipe', 'Standard recipe for dhja', 2000.00, '2025-07-15 20:24:47', '2025-07-15 20:24:47'),
(66, 156, 'efewf Recipe', 'Standard recipe for efewf', 2000.00, '2025-07-16 08:42:17', '2025-07-16 08:42:17'),
(67, 172, 'asdfqwf Recipe', 'Standard recipe for asdfqwf', 500.00, '2025-07-16 10:40:19', '2025-07-16 10:40:19'),
(68, 173, 'fwqf Recipe', 'Standard recipe for fwqf', 1500.00, '2025-07-16 10:46:09', '2025-07-16 10:46:09'),
(69, 174, 'sda Recipe', 'Standard recipe for sda', 300.00, '2025-07-16 10:46:47', '2025-07-16 10:46:47'),
(70, 175, 'qd Recipe', 'Standard recipe for qd', 500.00, '2025-07-16 10:57:38', '2025-07-16 10:57:38'),
(71, 176, 'efqdgfd Recipe', 'Standard recipe for efqdgfd', 2000.00, '2025-07-16 10:58:35', '2025-07-16 10:58:35'),
(72, 177, 'dfgsge Recipe', 'Standard recipe for dfgsge', 1000.00, '2025-07-16 11:05:19', '2025-07-16 11:05:19'),
(73, 178, 'ewfweg Recipe', 'Standard recipe for ewfweg', 400.00, '2025-07-16 11:17:33', '2025-07-16 11:17:33'),
(74, 179, 'askdj Recipe', 'Standard recipe for askdj', 300.00, '2025-07-16 11:32:57', '2025-07-16 11:32:57'),
(75, 180, 'asfw Recipe', 'Standard recipe for asfw', 1500.00, '2025-07-16 11:53:07', '2025-07-16 11:53:07'),
(76, 181, 'egwqw Recipe', 'Standard recipe for egwqw', 400.00, '2025-07-16 12:06:26', '2025-07-16 12:06:26'),
(77, 182, 'dfdqw Recipe', 'Standard recipe for dfdqw', 2000.00, '2025-07-16 12:55:41', '2025-07-16 12:55:41'),
(78, 183, 'fe Recipe', 'Standard recipe for fe', 2000.00, '2025-07-16 13:03:37', '2025-07-16 13:03:37'),
(79, 184, 'wqdef Recipe', 'Standard recipe for wqdef', 400.00, '2025-07-16 13:07:58', '2025-07-16 13:07:58'),
(80, 185, 'wfewf Recipe', 'Standard recipe for wfewf', 2000.00, '2025-07-16 13:28:30', '2025-07-16 13:28:30'),
(81, 186, 'plasas Recipe', 'Standard recipe for plasas', 120.00, '2025-07-16 13:29:31', '2025-07-16 13:29:31'),
(82, 187, 'safd Recipe', 'Standard recipe for safd', 2000.00, '2025-07-16 13:35:07', '2025-07-16 13:35:07'),
(83, 188, 'efef Recipe', 'Standard recipe for efef', 2000.00, '2025-07-16 13:41:42', '2025-07-16 13:41:42'),
(84, 189, 'wdwqd Recipe', 'Standard recipe for wdwqd', 40.00, '2025-07-16 13:50:24', '2025-07-16 13:50:24'),
(85, 191, 'sdg Recipe', 'Standard recipe for sdg', 2000.00, '2025-07-16 14:47:08', '2025-07-16 14:47:08'),
(86, 192, 'dfd Recipe', 'Standard recipe for dfd', 400.00, '2025-07-16 15:02:10', '2025-07-16 15:02:10'),
(87, 193, 'ijj Recipe', 'Standard recipe for ijj', 400.00, '2025-07-16 15:34:26', '2025-07-16 15:34:26'),
(88, 194, 'bat Recipe', 'Standard recipe for bat', 530.00, '2025-07-16 15:38:10', '2025-07-16 15:38:10'),
(89, 200, 'new Recipe', 'Standard recipe for new', 1000.00, '2025-07-16 16:40:12', '2025-07-16 16:40:12'),
(90, 201, 'qweeqweq Recipe', 'Standard recipe for qweeqweq', 500.00, '2025-07-16 16:44:17', '2025-07-16 16:44:17'),
(91, 202, 'ito ba Recipe', 'Standard recipe for ito ba', 1500.00, '2025-07-16 16:55:10', '2025-07-16 16:55:10'),
(92, 203, 'safqwf Recipe', 'Standard recipe for safqwf', 1500.00, '2025-07-16 17:01:42', '2025-07-16 17:01:42'),
(93, 205, 'fdsgfgaeg Recipe', 'Standard recipe for fdsgfgaeg', 1500.00, '2025-07-16 17:03:02', '2025-07-16 17:03:02'),
(94, 207, 'sadbd Recipe', 'Standard recipe for sadbd', 2000.00, '2025-07-16 17:22:35', '2025-07-16 17:22:35'),
(95, 208, 'vfeqw Recipe', 'Standard recipe for vfeqw', 2000.00, '2025-07-16 17:26:45', '2025-07-16 17:26:45'),
(96, 209, 'wrwfesrg Recipe', 'Standard recipe for wrwfesrg', 2000.00, '2025-07-16 17:30:01', '2025-07-16 17:30:01'),
(97, 210, 'really Recipe', 'Standard recipe for really', 1000.00, '2025-07-16 17:32:53', '2025-07-16 17:32:53'),
(98, 211, 'qwfweq Recipe', 'Standard recipe for qwfweq', 5.00, '2025-07-16 17:35:33', '2025-07-16 17:35:33'),
(99, 212, 'sdvdv Recipe', 'Standard recipe for sdvdv', 400.00, '2025-07-16 17:58:37', '2025-07-16 17:58:37'),
(100, 213, 'fewfwtwr Recipe', 'Standard recipe for fewfwtwr', 300.00, '2025-07-16 18:03:37', '2025-07-16 18:03:37'),
(101, 214, 'test Recipe', 'Standard recipe for test', 1000.00, '2025-07-16 18:24:35', '2025-07-16 18:24:35'),
(102, 215, 'wffqrqew Recipe', 'Standard recipe for wffqrqew', 2500.00, '2025-07-16 18:30:04', '2025-07-16 18:30:04'),
(103, 216, 'sgedheegrweg Recipe', 'Standard recipe for sgedheegrweg', 7.00, '2025-07-16 18:41:21', '2025-07-16 18:41:21'),
(104, 223, 'rkjwq Recipe', 'Standard recipe for rkjwq', 1010.00, '2025-07-17 13:49:58', '2025-07-17 13:49:58'),
(105, 224, 'msg Recipe', 'Standard recipe for msg', 1000.00, '2025-07-17 13:52:51', '2025-07-17 13:52:51'),
(106, 225, 'stress Recipe', 'Standard recipe for stress', 1500.00, '2025-07-17 14:03:01', '2025-07-17 14:03:01'),
(107, 226, 'jhdgehd Recipe', 'Standard recipe for jhdgehd', 1000.00, '2025-07-17 14:15:29', '2025-07-17 14:15:29'),
(108, 233, 'sfw Recipe', 'Standard recipe for sfw', 2000.00, '2025-07-17 15:02:02', '2025-07-17 15:02:02'),
(109, 234, 'dxgafa Recipe', 'Standard recipe for dxgafa', 100.00, '2025-07-17 15:07:59', '2025-07-17 15:07:59'),
(110, 235, 'wtwrt Recipe', 'Standard recipe for wtwrt', 2000.00, '2025-07-17 15:17:17', '2025-07-17 15:17:17'),
(111, 237, 'wrrrrr Recipe', 'Standard recipe for wrrrrr', 2000.00, '2025-07-17 15:37:28', '2025-07-17 15:37:28'),
(112, 239, 'twetqq Recipe', 'Standard recipe for twetqq', 2000.00, '2025-07-17 15:44:55', '2025-07-17 15:44:55'),
(113, 240, 'regg Recipe', 'Standard recipe for regg', 400.00, '2025-07-17 16:04:07', '2025-07-17 16:04:07'),
(114, 241, 'dgsgs Recipe', 'Standard recipe for dgsgs', 2500.00, '2025-07-17 16:11:56', '2025-07-17 16:11:56'),
(115, 242, 'fwf Recipe', 'Standard recipe for fwf', 1500.00, '2025-07-17 16:12:51', '2025-07-17 16:12:51'),
(116, 243, 'gfgsse Recipe', 'Standard recipe for gfgsse', 400.00, '2025-07-17 16:17:31', '2025-07-17 16:17:31'),
(117, 244, 'hsrerh Recipe', 'Standard recipe for hsrerh', 1500.00, '2025-07-17 16:22:17', '2025-07-17 16:22:17'),
(118, 245, 'cxgfh Recipe', 'Standard recipe for cxgfh', 2500.00, '2025-07-17 16:35:22', '2025-07-17 16:35:22'),
(119, 246, 'fdsgdf Recipe', 'Standard recipe for fdsgdf', 200.00, '2025-07-17 16:40:37', '2025-07-17 16:40:37'),
(120, 247, 'dfsgw Recipe', 'Standard recipe for dfsgw', 2000.00, '2025-07-17 16:48:51', '2025-07-17 16:48:51'),
(121, 248, 'gdfg Recipe', 'Standard recipe for gdfg', 2500.00, '2025-07-17 16:52:32', '2025-07-17 16:52:32'),
(122, 249, 'fgwg Recipe', 'Standard recipe for fgwg', 5.00, '2025-07-17 18:13:50', '2025-07-17 18:13:50'),
(123, 251, 'fesfew Recipe', 'Standard recipe for fesfew', 400.00, '2025-07-17 18:19:06', '2025-07-17 18:19:06'),
(124, 252, 'cszdas Recipe', 'Standard recipe for cszdas', 100.00, '2025-07-17 18:22:05', '2025-07-17 18:22:05'),
(125, 253, 'rsgg Recipe', 'Standard recipe for rsgg', 2500.00, '2025-07-17 18:27:24', '2025-07-17 18:27:24'),
(126, 255, 'sfh Recipe', 'Standard recipe for sfh', 2500.00, '2025-07-17 19:03:53', '2025-07-17 19:03:53'),
(127, 256, 'afdf Recipe', 'Standard recipe for afdf', 400.00, '2025-07-17 19:04:31', '2025-07-17 19:04:31'),
(128, 258, 'afeqf Recipe', 'Standard recipe for afeqf', 3000.00, '2025-07-17 19:05:08', '2025-07-17 19:05:08'),
(129, 259, 'efqf Recipe', 'Standard recipe for efqf', 500.00, '2025-07-17 19:07:22', '2025-07-17 19:07:22'),
(130, 260, 'fwqd Recipe', 'Standard recipe for fwqd', 2500.00, '2025-07-17 19:15:47', '2025-07-17 19:15:47'),
(131, 261, 'dewf Recipe', 'Standard recipe for dewf', 2500.00, '2025-07-18 16:43:45', '2025-07-18 16:43:45'),
(132, 262, 'safad Recipe', 'Standard recipe for safad', 1500.00, '2025-07-18 17:00:21', '2025-07-18 17:00:21'),
(133, 263, 'asdwed Recipe', 'Standard recipe for asdwed', 2000.00, '2025-07-18 17:38:51', '2025-07-18 17:38:51'),
(134, 264, 'awd Recipe', 'Standard recipe for awd', 400.00, '2025-07-18 17:49:15', '2025-07-18 17:49:15'),
(135, 265, 'xcsawc Recipe', 'Standard recipe for xcsawc', 400.00, '2025-07-18 17:49:39', '2025-07-18 17:49:39'),
(136, 266, 'prod Recipe', 'Standard recipe for prod', 2500.00, '2025-07-18 18:00:56', '2025-07-18 18:00:56'),
(137, 267, 'dsge Recipe', 'Standard recipe for dsge', 2500.00, '2025-07-18 18:14:16', '2025-07-18 18:14:16'),
(138, 268, 'dsgwf Recipe', 'Standard recipe for dsgwf', 1000.00, '2025-07-18 19:04:27', '2025-07-18 19:04:27'),
(139, 269, 'df Recipe', 'Standard recipe for df', 2500.00, '2025-07-18 19:15:17', '2025-07-18 19:15:17'),
(140, 270, 'ded Recipe', 'Standard recipe for ded', 2500.00, '2025-07-18 19:18:17', '2025-07-18 19:18:17'),
(141, 271, 'pleases Recipe', 'Standard recipe for pleases', 500.00, '2025-07-18 19:28:54', '2025-07-18 19:28:54'),
(142, 272, 'newwie Recipe', 'Standard recipe for newwie', 500.00, '2025-07-18 19:38:18', '2025-07-18 19:38:18'),
(143, 273, 'dfew Recipe', 'Standard recipe for dfew', 2000.00, '2025-07-18 19:49:00', '2025-07-18 19:49:00'),
(144, 274, 'ngilo Recipe', 'Standard recipe for ngilo', 2500.00, '2025-07-18 19:49:54', '2025-07-18 19:49:54'),
(145, 275, 'sacsa Recipe', 'Standard recipe for sacsa', 2000.00, '2025-07-18 19:50:50', '2025-07-18 19:50:50'),
(146, 276, 'SFas Recipe', 'Standard recipe for SFas', 500.00, '2025-07-18 19:52:44', '2025-07-18 19:52:44'),
(147, 277, 'sada Recipe', 'Standard recipe for sada', 2500.00, '2025-07-18 20:01:48', '2025-07-18 20:01:48'),
(148, 278, 'fdgd Recipe', 'Standard recipe for fdgd', 1500.00, '2025-07-18 20:02:54', '2025-07-18 20:02:54'),
(149, 279, 'scsad Recipe', 'Standard recipe for scsad', 500.00, '2025-07-18 20:06:18', '2025-07-18 20:06:18'),
(150, 280, 'zsf Recipe', 'Standard recipe for zsf', 100.00, '2025-07-18 20:07:16', '2025-07-18 20:07:16'),
(151, 281, 'asdsd Recipe', 'Standard recipe for asdsd', 2000.00, '2025-07-18 20:12:16', '2025-07-18 20:12:16'),
(152, 282, 'xzvdds Recipe', 'Standard recipe for xzvdds', 2500.00, '2025-07-18 20:30:44', '2025-07-18 20:30:44'),
(153, 283, 'productions Recipe', 'Standard recipe for productions', 2000.00, '2025-07-18 20:42:01', '2025-07-18 20:42:01'),
(154, 284, 'srwerdfs Recipe', 'Standard recipe for srwerdfs', 100.00, '2025-07-18 20:57:23', '2025-07-18 20:57:23'),
(155, 285, 'dsge45 Recipe', 'Standard recipe for dsge45', 2000.00, '2025-07-18 21:08:12', '2025-07-18 21:08:12'),
(156, 286, 'sdmfnejj Recipe', 'Standard recipe for sdmfnejj', 100.00, '2025-07-18 21:15:04', '2025-07-18 21:15:04'),
(157, 287, 'mamamo Recipe', 'Standard recipe for mamamo', 400.00, '2025-07-18 21:37:17', '2025-07-18 21:37:17'),
(158, 288, 'mamako Recipe', 'Standard recipe for mamako', 1000.00, '2025-07-18 21:38:52', '2025-07-18 21:38:52'),
(159, 289, 'sige nga Recipe', 'Standard recipe for sige nga', 600.00, '2025-07-18 21:44:44', '2025-07-18 21:44:44'),
(160, 290, 'eto baa Recipe', 'Standard recipe for eto baa', 2100.00, '2025-07-18 21:45:50', '2025-07-18 21:45:50'),
(161, 295, 'fewrr Recipe', 'Standard recipe for fewrr', 2500.00, '2025-07-18 22:36:57', '2025-07-18 22:36:57'),
(162, 296, 'wefwf Recipe', 'Standard recipe for wefwf', 2500.00, '2025-07-18 22:37:57', '2025-07-18 22:37:57'),
(163, 297, 'tdheyt Recipe', 'Standard recipe for tdheyt', 1000.00, '2025-07-19 06:47:07', '2025-07-19 06:47:07'),
(164, 298, 'qwq3 Recipe', 'Standard recipe for qwq3', 2500.00, '2025-07-19 10:20:54', '2025-07-19 10:20:54'),
(165, 299, 'daylight Recipe', 'Standard recipe for daylight', 1000.00, '2025-07-19 10:30:04', '2025-07-19 10:30:04'),
(166, 300, 'ettrt Recipe', 'Standard recipe for ettrt', 3000.00, '2025-07-19 10:42:47', '2025-07-19 10:42:47'),
(167, 301, 'even now Recipe', 'Standard recipe for even now', 1500.00, '2025-07-19 10:48:16', '2025-07-19 10:48:16'),
(168, 303, 'wait Recipe', 'Standard recipe for wait', 2000.00, '2025-07-19 15:19:45', '2025-07-19 15:19:45'),
(169, 304, 'costs Recipe', 'Standard recipe for costs', 1000.00, '2025-07-19 17:50:50', '2025-07-19 17:50:50'),
(170, 305, 'costs batch Recipe', 'Standard recipe for costs batch', 1000.00, '2025-07-19 17:53:45', '2025-07-19 17:53:45'),
(171, 307, 'operational Recipe', 'Standard recipe for operational', 1000.00, '2025-07-19 18:18:39', '2025-07-19 18:18:39'),
(172, 308, 'operational cost Recipe', 'Standard recipe for operational cost', 1500.00, '2025-07-19 18:34:41', '2025-07-19 18:34:41'),
(173, 309, 'imagine Recipe', 'Standard recipe for imagine', 1000.00, '2025-07-19 18:42:19', '2025-07-19 18:42:19'),
(174, 310, 'world Recipe', 'Standard recipe for world', 1500.00, '2025-07-19 18:44:40', '2025-07-19 18:44:40'),
(175, 312, 'otw Recipe', 'Standard recipe for otw', 540.00, '2025-07-19 18:58:37', '2025-07-19 18:58:37'),
(176, 313, 'asa Recipe', 'Standard recipe for asa', 610.00, '2025-07-19 19:04:39', '2025-07-19 19:04:39'),
(177, 314, 'drip Recipe', 'Standard recipe for drip', 1040.00, '2025-07-19 19:06:22', '2025-07-19 19:06:22'),
(178, 315, 'fix Recipe', 'Standard recipe for fix', 1000.00, '2025-07-19 19:09:15', '2025-07-19 19:09:15'),
(179, 316, 'sdde Recipe', 'Standard recipe for sdde', 2500.00, '2025-07-19 19:18:10', '2025-07-19 19:18:10'),
(180, 318, 'gumanon Recipe', 'Standard recipe for gumanon', 2550.00, '2025-07-19 19:29:13', '2025-07-19 19:29:13'),
(181, 319, 'private Recipe', 'Standard recipe for private', 1200.00, '2025-07-19 19:40:06', '2025-07-19 19:40:06'),
(182, 320, 'okay Recipe', 'Standard recipe for okay', 2510.00, '2025-07-19 19:41:24', '2025-07-19 19:41:24'),
(183, 321, 'missing Recipe', 'Standard recipe for missing', 1005.00, '2025-07-19 20:27:41', '2025-07-19 20:27:41'),
(184, 322, 'heyeh Recipe', 'Standard recipe for heyeh', 1120.00, '2025-07-19 20:41:56', '2025-07-19 20:41:56'),
(185, 325, 'heeyye Recipe', 'Standard recipe for heeyye', 2520.00, '2025-07-19 20:45:01', '2025-07-19 20:45:01'),
(186, 330, 'wefefwe Recipe', 'Standard recipe for wefefwe', 2500.00, '2025-07-19 21:35:32', '2025-07-19 21:35:32'),
(187, 331, 'eswfwrr Recipe', 'Standard recipe for eswfwrr', 2500.00, '2025-07-19 21:38:53', '2025-07-19 21:38:53'),
(188, 336, 'gabriela Recipe', 'Standard recipe for gabriela', 2000.00, '2025-07-20 05:18:56', '2025-07-20 05:18:56'),
(189, 338, 'taytay Recipe', 'Standard recipe for taytay', 2000.00, '2025-07-20 05:21:11', '2025-07-20 05:21:11'),
(190, 339, 'key Recipe', 'Standard recipe for key', 1500.00, '2025-07-20 11:50:48', '2025-07-20 11:50:48'),
(191, 340, 'ano Recipe', 'Standard recipe for ano', 1500.00, '2025-07-20 12:10:18', '2025-07-20 12:10:18'),
(192, 341, 'nice Recipe', 'Standard recipe for nice', 1000.00, '2025-07-20 12:16:15', '2025-07-20 12:16:15'),
(193, 343, 'somebody Recipe', 'Standard recipe for somebody', 120.00, '2025-07-20 13:51:35', '2025-07-20 13:51:35'),
(194, 344, 'fwefw Recipe', 'Standard recipe for fwefw', 37.50, '2025-07-20 14:19:58', '2025-07-20 14:19:58'),
(195, 346, 'adwee Recipe', 'Standard recipe for adwee', 75.00, '2025-07-20 14:20:55', '2025-07-20 14:20:55'),
(196, 347, 'haiiiiiii Recipe', 'Standard recipe for haiiiiiii', 46.15, '2025-07-20 14:22:41', '2025-07-20 14:22:41'),
(197, 349, 'numbers Recipe', 'Standard recipe for numbers', 54.55, '2025-07-20 14:59:59', '2025-07-20 14:59:59'),
(198, 350, 'Love Scenario Recipe', 'Standard recipe for Love Scenario', 120.20, '2025-07-20 15:22:32', '2025-07-20 15:22:32'),
(199, 352, 'yoww Recipe', 'Standard recipe for yoww', 8.33, '2025-07-20 16:00:45', '2025-07-20 16:00:45'),
(200, 354, 'atee Recipe', 'Standard recipe for atee', 150.00, '2025-07-20 17:02:46', '2025-07-20 17:02:46'),
(201, 355, 'knock Recipe', 'Standard recipe for knock', 2.50, '2025-07-20 17:20:02', '2025-07-20 17:20:02'),
(202, 356, 'hey?? Recipe', 'Standard recipe for hey??', 20.00, '2025-07-20 17:23:41', '2025-07-20 17:23:41'),
(203, 357, 'nubato Recipe', 'Standard recipe for nubato', 31.25, '2025-07-20 17:47:49', '2025-07-20 17:47:49'),
(204, 358, 'upgrade Recipe', 'Standard recipe for upgrade', 22.22, '2025-07-20 17:52:34', '2025-07-20 17:52:34'),
(205, 359, 'now Recipe', 'Standard recipe for now', 23.26, '2025-07-20 17:53:53', '2025-07-20 17:53:53'),
(206, 360, 'sdff Recipe', 'Standard recipe for sdff', 12.20, '2025-07-20 17:55:17', '2025-07-20 17:55:17'),
(207, 362, 'dibaaa Recipe', 'Standard recipe for dibaaa', 37.50, '2025-07-20 17:59:30', '2025-07-20 17:59:30'),
(208, 365, 'vamfayr Recipe', 'Standard recipe for vamfayr', 41.67, '2025-07-20 18:11:03', '2025-07-20 18:11:03'),
(209, 366, 'syndrome Recipe', 'Standard recipe for syndrome', 45.45, '2025-07-20 18:18:30', '2025-07-20 18:18:30'),
(210, 367, 'love Recipe', 'Standard recipe for love', 125.00, '2025-07-20 18:21:17', '2025-07-20 18:21:17'),
(211, 368, 'name Recipe', 'Standard recipe for name', 100.00, '2025-07-20 18:24:47', '2025-07-20 18:24:47'),
(212, 369, 'juskooo Recipe', 'Standard recipe for juskooo', 41.67, '2025-07-20 18:27:33', '2025-07-20 18:27:33'),
(213, 370, 'hay nakonaman Recipe', 'Standard recipe for hay nakonaman', 45.45, '2025-07-20 18:28:59', '2025-07-20 18:28:59'),
(214, 372, 'mudmee Recipe', 'Standard recipe for mudmee', 62.50, '2025-07-20 18:48:01', '2025-07-20 18:48:01'),
(215, 373, 'sdrgr Recipe', 'Standard recipe for sdrgr', 71.43, '2025-07-20 19:04:51', '2025-07-20 19:04:51'),
(216, 374, 'weewf Recipe', 'Standard recipe for weewf', 83.33, '2025-07-20 19:05:45', '2025-07-20 19:05:45'),
(217, 376, 'Product1 Recipe', 'Standard recipe for Product1', 250.00, '2025-07-21 01:15:49', '2025-07-21 01:15:49'),
(218, 377, 'Product2 Recipe', 'Standard recipe for Product2', 250.00, '2025-07-21 01:17:59', '2025-07-21 01:17:59'),
(219, 379, 'Soap Recipe', 'Standard recipe for Soap', 2.00, '2025-07-21 01:33:53', '2025-07-21 01:33:53'),
(220, 380, 'Complete Recipe', 'Standard recipe for Complete', 100.00, '2025-07-21 18:06:15', '2025-07-21 18:06:15'),
(221, 381, 'normal Recipe', 'Standard recipe for normal', 2.50, '2025-07-24 15:01:32', '2025-07-24 15:01:32'),
(222, 382, 'Lux Recipe', 'Standard recipe for Lux', 3.33, '2025-07-24 16:21:51', '2025-07-24 16:21:51'),
(223, 383, 'Nescafe Recipe', 'Standard recipe for Nescafe', 240.00, '2025-07-24 16:24:41', '2025-07-24 16:24:41'),
(224, 385, 'past Recipe', 'Standard recipe for past', 305.00, '2025-07-24 16:59:44', '2025-07-24 16:59:44'),
(225, 386, 'product3 Recipe', 'Standard recipe for product3', 16.67, '2025-07-27 07:26:39', '2025-07-27 07:26:39'),
(226, 387, 'product5 Recipe', 'Standard recipe for product5', 600.00, '2025-07-27 09:45:18', '2025-07-27 09:45:18'),
(227, 388, 'mariaclara Recipe', 'Standard recipe for mariaclara', 10.00, '2025-07-27 11:14:07', '2025-07-27 11:14:07'),
(228, 389, 'eyy Recipe', 'Standard recipe for eyy', 0.40, '2025-07-27 11:24:01', '2025-07-27 11:24:01'),
(229, 391, 'woh Recipe', 'Standard recipe for woh', 2.56, '2025-07-27 12:43:11', '2025-07-27 12:43:11'),
(230, 392, 'wqdwef Recipe', 'Standard recipe for wqdwef', 40.00, '2025-07-27 13:22:56', '2025-07-27 13:22:56'),
(231, 393, 'sfef Recipe', 'Standard recipe for sfef', 40.00, '2025-07-27 13:23:25', '2025-07-27 13:23:25'),
(232, 394, 'zxvdv Recipe', 'Standard recipe for zxvdv', 66.67, '2025-07-27 13:54:15', '2025-07-27 13:54:15'),
(233, 396, 'afew Recipe', 'Standard recipe for afew', 66.67, '2025-07-27 14:07:09', '2025-07-27 14:07:09'),
(234, 397, 'sadaf Recipe', 'Standard recipe for sadaf', 100.00, '2025-07-27 19:51:07', '2025-07-27 19:51:07'),
(235, 399, 'Piña Dishwashing Soap Small Recipe', 'Standard recipe for Piña Dishwashing Soap Small', 2200.00, '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(236, 400, 'Pina Pie Recipe', 'Standard recipe for Pina Pie', 60.00, '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(237, 401, 'Pina Pie Recipe', 'Standard recipe for Pina Pie', 347.28, '2025-07-28 03:35:53', '2025-07-28 03:35:53'),
(238, 402, 'Pina Bars Pouch Recipe', 'Standard recipe for Pina Bars Pouch', 1695.25, '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(239, 403, 'Pina Bars Box Recipe', 'Standard recipe for Pina Bars Box', 572.89, '2025-07-28 03:49:42', '2025-07-28 03:49:42'),
(240, 404, 'Pina Putoseko Recipe', 'Standard recipe for Pina Putoseko', 360.35, '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(241, 405, 'Pina Ube Bars Recipe', 'Standard recipe for Pina Ube Bars', 1131.07, '2025-07-28 03:58:53', '2025-07-28 03:58:53'),
(242, 406, 'Pina Champoy Recipe', 'Standard recipe for Pina Champoy', 867.32, '2025-07-28 04:02:26', '2025-07-28 04:02:26'),
(243, 407, 'Pina Tuyo Recipe', 'Standard recipe for Pina Tuyo', 741.00, '2025-07-28 04:04:45', '2025-07-28 04:04:45'),
(244, 408, 'Pina Tinapa Recipe', 'Standard recipe for Pina Tinapa', 1335.00, '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(245, 409, 'Pina Mangga Recipe', 'Standard recipe for Pina Mangga', 741.00, '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(246, 410, '130 Recipe', 'Standard recipe for 130', 340.00, '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(247, 411, 'Pina Concentrate Recipe', 'Standard recipe for Pina Concentrate', 450.00, '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(248, 412, 'Piña Dishwashing Soap Large Recipe', 'Standard recipe for Piña Dishwashing Soap Large', 120.00, '2025-07-28 04:15:59', '2025-07-28 04:15:59');

-- --------------------------------------------------------

--
-- Table structure for table `recipe_materials`
--

CREATE TABLE `recipe_materials` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT 0.00,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recipe_materials`
--

INSERT INTO `recipe_materials` (`id`, `recipe_id`, `material_id`, `quantity`, `unit`, `unit_cost`, `total_cost`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-13 18:00:27', '2025-07-13 18:00:27'),
(2, 2, 32, 10.000, 'units', 0.00, 0.00, '', '2025-07-13 18:00:27', '2025-07-13 18:00:27'),
(3, 3, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 18:34:07', '2025-07-13 18:34:07'),
(4, 4, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-13 18:47:58', '2025-07-13 18:47:58'),
(5, 5, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-13 18:52:20', '2025-07-13 18:52:20'),
(6, 6, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-13 18:55:09', '2025-07-13 18:55:09'),
(7, 7, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 18:57:43', '2025-07-13 18:57:43'),
(8, 8, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-13 19:06:04', '2025-07-13 19:06:04'),
(9, 9, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 19:50:33', '2025-07-13 19:50:33'),
(10, 10, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-13 19:54:22', '2025-07-13 19:54:22'),
(11, 11, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-13 19:57:53', '2025-07-13 19:57:53'),
(12, 12, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 20:03:51', '2025-07-13 20:03:51'),
(13, 13, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 20:05:18', '2025-07-13 20:05:18'),
(14, 14, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 20:10:44', '2025-07-13 20:10:44'),
(15, 15, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-13 20:18:06', '2025-07-13 20:18:06'),
(16, 16, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 20:19:37', '2025-07-13 20:19:37'),
(17, 17, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-13 20:29:39', '2025-07-13 20:29:39'),
(18, 18, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 14:39:09', '2025-07-14 14:39:09'),
(19, 18, 29, 2.000, 'units', 0.00, 0.00, '', '2025-07-14 14:39:09', '2025-07-14 14:39:09'),
(20, 19, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 15:16:37', '2025-07-14 15:16:37'),
(21, 20, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 15:19:23', '2025-07-14 15:19:23'),
(22, 21, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-14 15:21:21', '2025-07-14 15:21:21'),
(23, 22, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 15:27:21', '2025-07-14 15:27:21'),
(24, 23, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 15:33:21', '2025-07-14 15:33:21'),
(25, 24, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-14 15:38:10', '2025-07-14 15:38:10'),
(26, 25, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 15:40:54', '2025-07-14 15:40:54'),
(27, 26, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 15:45:04', '2025-07-14 15:45:04'),
(28, 27, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 15:46:09', '2025-07-14 15:46:09'),
(29, 28, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 15:59:46', '2025-07-14 15:59:46'),
(30, 29, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 16:08:34', '2025-07-14 16:08:34'),
(31, 30, 32, 7.000, 'units', 0.00, 0.00, '', '2025-07-14 16:20:58', '2025-07-14 16:20:58'),
(32, 31, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 16:38:15', '2025-07-14 16:38:15'),
(33, 32, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 17:19:45', '2025-07-14 17:19:45'),
(34, 33, 32, 7.000, 'units', 0.00, 0.00, '', '2025-07-14 17:36:35', '2025-07-14 17:36:35'),
(35, 34, 32, 7.000, 'units', 0.00, 0.00, '', '2025-07-14 17:50:02', '2025-07-14 17:50:02'),
(36, 35, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-14 17:51:32', '2025-07-14 17:51:32'),
(37, 36, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 18:03:22', '2025-07-14 18:03:22'),
(38, 37, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 18:04:54', '2025-07-14 18:04:54'),
(39, 38, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 18:11:04', '2025-07-14 18:11:04'),
(40, 39, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 18:24:37', '2025-07-14 18:24:37'),
(41, 39, 22, 4.000, 'units', 0.00, 0.00, '', '2025-07-14 18:24:37', '2025-07-14 18:24:37'),
(42, 40, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 18:27:02', '2025-07-14 18:27:02'),
(43, 41, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-14 18:35:07', '2025-07-14 18:35:07'),
(44, 42, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-14 18:38:31', '2025-07-14 18:38:31'),
(45, 43, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-14 19:34:05', '2025-07-14 19:34:05'),
(46, 44, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-14 19:39:04', '2025-07-14 19:39:04'),
(47, 45, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-15 08:17:21', '2025-07-15 08:17:21'),
(48, 46, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 08:18:12', '2025-07-15 08:18:12'),
(49, 47, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-15 08:29:56', '2025-07-15 08:29:56'),
(50, 48, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-15 08:52:13', '2025-07-15 08:52:13'),
(51, 49, 30, 2.000, 'units', 0.00, 0.00, '', '2025-07-15 09:01:30', '2025-07-15 09:01:30'),
(52, 50, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 09:59:28', '2025-07-15 09:59:28'),
(53, 51, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-15 10:11:39', '2025-07-15 10:11:39'),
(54, 52, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-15 10:24:25', '2025-07-15 10:24:25'),
(55, 53, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-15 10:44:09', '2025-07-15 10:44:09'),
(56, 54, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-15 10:45:12', '2025-07-15 10:45:12'),
(57, 55, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-15 10:54:19', '2025-07-15 10:54:19'),
(58, 56, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-15 11:35:27', '2025-07-15 11:35:27'),
(59, 57, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-15 12:00:25', '2025-07-15 12:00:25'),
(60, 58, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-15 12:19:55', '2025-07-15 12:19:55'),
(61, 59, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-15 12:22:53', '2025-07-15 12:22:53'),
(62, 60, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 12:27:18', '2025-07-15 12:27:18'),
(63, 61, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 12:28:38', '2025-07-15 12:28:38'),
(64, 62, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-15 18:51:54', '2025-07-15 18:51:54'),
(65, 63, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 19:24:28', '2025-07-15 19:24:28'),
(66, 64, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 19:58:29', '2025-07-15 19:58:29'),
(67, 65, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-15 20:24:47', '2025-07-15 20:24:47'),
(68, 66, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 08:42:17', '2025-07-16 08:42:17'),
(69, 67, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-16 10:40:19', '2025-07-16 10:40:19'),
(70, 68, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 10:46:09', '2025-07-16 10:46:09'),
(71, 69, 30, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 10:46:47', '2025-07-16 10:46:47'),
(72, 70, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-16 10:57:38', '2025-07-16 10:57:38'),
(73, 71, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 10:58:36', '2025-07-16 10:58:36'),
(74, 72, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-16 11:05:19', '2025-07-16 11:05:19'),
(75, 73, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 11:17:33', '2025-07-16 11:17:33'),
(76, 74, 30, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 11:32:57', '2025-07-16 11:32:57'),
(77, 75, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 11:53:07', '2025-07-16 11:53:07'),
(78, 76, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 12:06:26', '2025-07-16 12:06:26'),
(79, 77, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 12:55:41', '2025-07-16 12:55:41'),
(80, 78, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:03:37', '2025-07-16 13:03:37'),
(81, 79, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:07:58', '2025-07-16 13:07:58'),
(82, 80, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:28:30', '2025-07-16 13:28:30'),
(83, 81, 22, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:29:31', '2025-07-16 13:29:31'),
(84, 82, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:35:07', '2025-07-16 13:35:07'),
(85, 83, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:41:42', '2025-07-16 13:41:42'),
(86, 84, 31, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 13:50:24', '2025-07-16 13:50:24'),
(87, 85, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 14:47:08', '2025-07-16 14:47:08'),
(88, 86, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 15:02:10', '2025-07-16 15:02:10'),
(89, 87, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 15:34:27', '2025-07-16 15:34:27'),
(90, 88, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-16 15:38:10', '2025-07-16 15:38:10'),
(91, 88, 31, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 15:38:10', '2025-07-16 15:38:10'),
(92, 89, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-16 16:40:12', '2025-07-16 16:40:12'),
(93, 90, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-16 16:44:17', '2025-07-16 16:44:17'),
(94, 91, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 16:55:10', '2025-07-16 16:55:10'),
(95, 92, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 17:01:42', '2025-07-16 17:01:42'),
(96, 93, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 17:03:02', '2025-07-16 17:03:02'),
(97, 94, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 17:22:35', '2025-07-16 17:22:35'),
(98, 95, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 17:26:45', '2025-07-16 17:26:45'),
(99, 96, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 17:30:01', '2025-07-16 17:30:01'),
(100, 97, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-16 17:32:53', '2025-07-16 17:32:53'),
(101, 98, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-16 17:35:33', '2025-07-16 17:35:33'),
(102, 99, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-16 17:58:37', '2025-07-16 17:58:37'),
(103, 100, 30, 3.000, 'units', 0.00, 0.00, '', '2025-07-16 18:03:37', '2025-07-16 18:03:37'),
(104, 101, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-16 18:24:35', '2025-07-16 18:24:35'),
(105, 102, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-16 18:30:04', '2025-07-16 18:30:04'),
(106, 103, 32, 0.014, 'units', 0.00, 0.00, '', '2025-07-16 18:41:21', '2025-07-16 18:41:21'),
(107, 104, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-17 13:49:58', '2025-07-17 13:49:58'),
(108, 104, 31, 1.000, 'units', 0.00, 0.00, '', '2025-07-17 13:49:58', '2025-07-17 13:49:58'),
(109, 105, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-17 13:52:51', '2025-07-17 13:52:51'),
(110, 106, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-17 14:03:01', '2025-07-17 14:03:01'),
(111, 107, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-17 14:15:29', '2025-07-17 14:15:29'),
(112, 108, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 15:02:02', '2025-07-17 15:02:02'),
(113, 109, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-17 15:07:59', '2025-07-17 15:07:59'),
(114, 110, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 15:17:17', '2025-07-17 15:17:17'),
(115, 111, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 15:37:28', '2025-07-17 15:37:28'),
(116, 112, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 15:44:55', '2025-07-17 15:44:55'),
(117, 113, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 16:04:07', '2025-07-17 16:04:07'),
(118, 114, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 16:11:56', '2025-07-17 16:11:56'),
(119, 115, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-17 16:12:51', '2025-07-17 16:12:51'),
(120, 116, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 16:17:31', '2025-07-17 16:17:31'),
(121, 117, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-17 16:22:17', '2025-07-17 16:22:17'),
(122, 118, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 16:35:22', '2025-07-17 16:35:22'),
(123, 119, 30, 2.000, 'units', 0.00, 0.00, '', '2025-07-17 16:40:37', '2025-07-17 16:40:37'),
(124, 120, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 16:48:51', '2025-07-17 16:48:51'),
(125, 121, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 16:52:32', '2025-07-17 16:52:32'),
(126, 122, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-17 18:13:51', '2025-07-17 18:13:51'),
(127, 123, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 18:19:06', '2025-07-17 18:19:06'),
(128, 124, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-17 18:22:06', '2025-07-17 18:22:06'),
(129, 125, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 18:27:24', '2025-07-17 18:27:24'),
(130, 126, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 19:03:53', '2025-07-17 19:03:53'),
(131, 127, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-17 19:04:31', '2025-07-17 19:04:31'),
(132, 128, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-17 19:05:08', '2025-07-17 19:05:08'),
(133, 129, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 19:07:22', '2025-07-17 19:07:22'),
(134, 130, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-17 19:15:47', '2025-07-17 19:15:47'),
(135, 131, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 16:43:45', '2025-07-18 16:43:45'),
(136, 132, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-18 17:00:21', '2025-07-18 17:00:21'),
(137, 133, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 17:38:51', '2025-07-18 17:38:51'),
(138, 134, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 17:49:15', '2025-07-18 17:49:15'),
(139, 135, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 17:49:39', '2025-07-18 17:49:39'),
(140, 136, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 18:00:56', '2025-07-18 18:00:56'),
(141, 137, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 18:14:16', '2025-07-18 18:14:16'),
(142, 138, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-18 19:04:27', '2025-07-18 19:04:27'),
(143, 139, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 19:15:17', '2025-07-18 19:15:17'),
(144, 140, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 19:18:17', '2025-07-18 19:18:17'),
(145, 141, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 19:28:54', '2025-07-18 19:28:54'),
(146, 142, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 19:38:18', '2025-07-18 19:38:18'),
(147, 143, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 19:49:00', '2025-07-18 19:49:00'),
(148, 144, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 19:49:54', '2025-07-18 19:49:54'),
(149, 145, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 19:50:51', '2025-07-18 19:50:51'),
(150, 146, 30, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 19:52:44', '2025-07-18 19:52:44'),
(151, 147, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 20:01:48', '2025-07-18 20:01:48'),
(152, 148, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-18 20:02:54', '2025-07-18 20:02:54'),
(153, 149, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 20:06:18', '2025-07-18 20:06:18'),
(154, 150, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 20:07:16', '2025-07-18 20:07:16'),
(155, 151, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 20:12:16', '2025-07-18 20:12:16'),
(156, 152, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 20:30:44', '2025-07-18 20:30:44'),
(157, 153, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 20:42:01', '2025-07-18 20:42:01'),
(158, 154, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 20:57:23', '2025-07-18 20:57:23'),
(159, 155, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 21:08:12', '2025-07-18 21:08:12'),
(160, 156, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 21:15:04', '2025-07-18 21:15:04'),
(161, 157, 30, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 21:37:17', '2025-07-18 21:37:17'),
(162, 158, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-18 21:38:52', '2025-07-18 21:38:52'),
(163, 159, 30, 6.000, 'units', 0.00, 0.00, '', '2025-07-18 21:44:44', '2025-07-18 21:44:44'),
(164, 160, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-18 21:45:50', '2025-07-18 21:45:50'),
(165, 160, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-18 21:45:50', '2025-07-18 21:45:50'),
(166, 161, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 22:36:57', '2025-07-18 22:36:57'),
(167, 162, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-18 22:37:57', '2025-07-18 22:37:57'),
(168, 163, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 06:47:07', '2025-07-19 06:47:07'),
(169, 164, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 10:20:54', '2025-07-19 10:20:54'),
(170, 165, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 10:30:04', '2025-07-19 10:30:04'),
(171, 166, 32, 6.000, 'units', 0.00, 0.00, '', '2025-07-19 10:42:47', '2025-07-19 10:42:47'),
(172, 167, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-19 10:48:16', '2025-07-19 10:48:16'),
(173, 168, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-19 15:19:45', '2025-07-19 15:19:45'),
(174, 169, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 17:50:50', '2025-07-19 17:50:50'),
(175, 170, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 17:53:45', '2025-07-19 17:53:45'),
(176, 171, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 18:18:39', '2025-07-19 18:18:39'),
(177, 172, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-19 18:34:41', '2025-07-19 18:34:41'),
(178, 173, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 18:42:19', '2025-07-19 18:42:19'),
(179, 174, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-19 18:44:40', '2025-07-19 18:44:40'),
(180, 175, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 18:58:37', '2025-07-19 18:58:37'),
(181, 175, 31, 4.000, 'units', 0.00, 0.00, '', '2025-07-19 18:58:37', '2025-07-19 18:58:37'),
(182, 176, 32, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 19:04:39', '2025-07-19 19:04:39'),
(183, 176, 31, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 19:04:39', '2025-07-19 19:04:39'),
(184, 176, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 19:04:39', '2025-07-19 19:04:39'),
(185, 177, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 19:06:22', '2025-07-19 19:06:22'),
(186, 177, 27, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 19:06:22', '2025-07-19 19:06:22'),
(187, 178, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 19:09:15', '2025-07-19 19:09:15'),
(188, 179, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 19:18:10', '2025-07-19 19:18:10'),
(189, 180, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 19:29:13', '2025-07-19 19:29:13'),
(190, 180, 31, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 19:29:13', '2025-07-19 19:29:13'),
(191, 181, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 19:40:06', '2025-07-19 19:40:06'),
(192, 181, 30, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 19:40:06', '2025-07-19 19:40:06'),
(193, 182, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 19:41:24', '2025-07-19 19:41:24'),
(194, 182, 31, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 19:41:24', '2025-07-19 19:41:24'),
(195, 183, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 20:27:41', '2025-07-19 20:27:41'),
(196, 183, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 20:27:41', '2025-07-19 20:27:41'),
(197, 184, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 20:41:56', '2025-07-19 20:41:56'),
(198, 184, 31, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 20:41:56', '2025-07-19 20:41:56'),
(199, 184, 37, 1.000, 'units', 0.00, 0.00, '', '2025-07-19 20:41:56', '2025-07-19 20:41:56'),
(200, 185, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 20:45:01', '2025-07-19 20:45:01'),
(201, 185, 31, 2.000, 'units', 0.00, 0.00, '', '2025-07-19 20:45:01', '2025-07-19 20:45:01'),
(202, 186, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 21:35:32', '2025-07-19 21:35:32'),
(203, 187, 32, 5.000, 'units', 0.00, 0.00, '', '2025-07-19 21:38:53', '2025-07-19 21:38:53'),
(204, 188, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-20 05:18:56', '2025-07-20 05:18:56'),
(205, 189, 32, 4.000, 'units', 0.00, 0.00, '', '2025-07-20 05:21:11', '2025-07-20 05:21:11'),
(206, 190, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-20 11:50:48', '2025-07-20 11:50:48'),
(207, 191, 32, 3.000, 'units', 0.00, 0.00, '', '2025-07-20 12:10:18', '2025-07-20 12:10:18'),
(208, 192, 32, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 12:16:15', '2025-07-20 12:16:15'),
(209, 193, 22, 4.000, 'units', 0.00, 0.00, '', '2025-07-20 13:51:35', '2025-07-20 13:51:35'),
(210, 194, 22, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 14:19:58', '2025-07-20 14:19:58'),
(211, 195, 22, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 14:20:55', '2025-07-20 14:20:55'),
(212, 196, 22, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 14:22:41', '2025-07-20 14:22:41'),
(213, 197, 22, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 14:59:59', '2025-07-20 14:59:59'),
(214, 198, 22, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 15:22:32', '2025-07-20 15:22:32'),
(215, 198, 24, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 15:22:32', '2025-07-20 15:22:32'),
(216, 199, 38, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 16:00:45', '2025-07-20 16:00:45'),
(217, 200, 22, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 17:02:46', '2025-07-20 17:02:46'),
(218, 201, 29, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 17:20:02', '2025-07-20 17:20:02'),
(219, 202, 39, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 17:23:41', '2025-07-20 17:23:41'),
(220, 203, 39, 3.000, 'units', 0.00, 0.00, '', '2025-07-20 17:47:49', '2025-07-20 17:47:49'),
(221, 204, 39, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 17:52:34', '2025-07-20 17:52:34'),
(222, 205, 39, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 17:53:53', '2025-07-20 17:53:53'),
(223, 206, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 17:55:17', '2025-07-20 17:55:17'),
(224, 207, 39, 3.000, 'units', 0.00, 0.00, '', '2025-07-20 17:59:30', '2025-07-20 17:59:30'),
(225, 208, 39, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 18:11:03', '2025-07-20 18:11:03'),
(226, 209, 39, 2.000, 'units', 0.00, 0.00, '', '2025-07-20 18:18:30', '2025-07-20 18:18:30'),
(227, 210, 39, 5.000, 'units', 0.00, 0.00, '', '2025-07-20 18:21:17', '2025-07-20 18:21:17'),
(228, 211, 39, 3.000, 'units', 0.00, 0.00, '', '2025-07-20 18:24:47', '2025-07-20 18:24:47'),
(229, 212, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 18:27:33', '2025-07-20 18:27:33'),
(230, 213, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 18:28:59', '2025-07-20 18:28:59'),
(231, 214, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 18:48:01', '2025-07-20 18:48:01'),
(232, 215, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 19:04:51', '2025-07-20 19:04:51'),
(233, 216, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-20 19:05:45', '2025-07-20 19:05:45'),
(234, 217, 39, 2.000, 'units', 0.00, 0.00, '', '2025-07-21 01:15:49', '2025-07-21 01:15:49'),
(235, 218, 39, 1.000, 'units', 0.00, 0.00, '', '2025-07-21 01:17:59', '2025-07-21 01:17:59'),
(236, 219, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-21 01:33:53', '2025-07-21 01:33:53'),
(237, 220, 22, 1.000, 'units', 0.00, 0.00, '', '2025-07-21 18:06:15', '2025-07-21 18:06:15'),
(238, 221, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-24 15:01:32', '2025-07-24 15:01:32'),
(239, 222, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-24 16:21:51', '2025-07-24 16:21:51'),
(240, 223, 22, 2.000, 'units', 0.00, 0.00, '', '2025-07-24 16:24:41', '2025-07-24 16:24:41'),
(241, 224, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-24 16:59:44', '2025-07-24 16:59:44'),
(242, 224, 22, 1.000, 'units', 0.00, 0.00, '', '2025-07-24 16:59:44', '2025-07-24 16:59:44'),
(243, 225, 38, 1.000, 'units', 0.00, 0.00, '', '2025-07-27 07:26:39', '2025-07-27 07:26:39'),
(244, 226, 22, 1.000, 'units', 0.00, 0.00, '', '2025-07-27 09:45:18', '2025-07-27 09:45:18'),
(245, 227, 29, 1.000, 'units', 0.00, 0.00, '', '2025-07-27 11:14:07', '2025-07-27 11:14:07'),
(246, 228, 24, 1.000, 'units', 0.00, 0.00, '', '2025-07-27 11:24:01', '2025-07-27 11:24:01'),
(247, 229, 38, 2.000, 'units', 0.00, 0.00, '', '2025-07-27 12:43:11', '2025-07-27 12:43:11'),
(248, 230, 40, 2.000, 'units', 0.00, 0.00, '', '2025-07-27 13:22:56', '2025-07-27 13:22:56'),
(249, 231, 40, 2.000, 'units', 0.00, 0.00, '', '2025-07-27 13:23:25', '2025-07-27 13:23:25'),
(250, 232, 40, 2.000, 'units', 0.00, 0.00, '', '2025-07-27 13:54:15', '2025-07-27 13:54:15'),
(251, 233, 40, 1.000, 'units', 0.00, 0.00, '', '2025-07-27 14:07:09', '2025-07-27 14:07:09'),
(252, 234, 40, 1.000, 'units', 0.00, 0.00, '', '2025-07-27 19:51:07', '2025-07-27 19:51:07'),
(253, 235, 48, 1.000, 'units', 0.00, 0.00, '', '2025-07-28 00:33:15', '2025-07-28 00:33:15'),
(254, 236, 41, 2.000, 'units', 0.00, 0.00, '', '2025-07-28 03:09:47', '2025-07-28 03:09:47'),
(255, 237, 41, 3.000, 'units', 0.00, 0.00, '', '2025-07-28 03:35:53', '2025-07-28 03:35:53'),
(256, 237, 46, 0.100, 'units', 0.00, 0.00, '', '2025-07-28 03:35:53', '2025-07-28 03:35:53'),
(257, 237, 48, 0.010, 'units', 0.00, 0.00, '', '2025-07-28 03:35:53', '2025-07-28 03:35:53'),
(258, 237, 42, 2.000, 'units', 0.00, 0.00, '', '2025-07-28 03:35:53', '2025-07-28 03:35:53'),
(259, 237, 44, 1.000, 'units', 0.00, 0.00, '', '2025-07-28 03:35:53', '2025-07-28 03:35:53'),
(260, 238, 49, 0.500, 'units', 0.00, 0.00, '', '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(261, 238, 48, 0.030, 'units', 0.00, 0.00, '', '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(262, 238, 41, 5.000, 'units', 0.00, 0.00, '', '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(263, 238, 46, 0.200, 'units', 0.00, 0.00, '', '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(264, 238, 44, 0.500, 'units', 0.00, 0.00, '', '2025-07-28 03:44:48', '2025-07-28 03:44:48'),
(265, 239, 48, 0.030, 'units', 0.00, 0.00, '', '2025-07-28 03:49:42', '2025-07-28 03:49:42'),
(266, 239, 46, 0.200, 'units', 0.00, 0.00, '', '2025-07-28 03:49:42', '2025-07-28 03:49:42'),
(267, 239, 42, 10.000, 'units', 0.00, 0.00, '', '2025-07-28 03:49:42', '2025-07-28 03:49:42'),
(268, 239, 44, 0.500, 'units', 0.00, 0.00, '', '2025-07-28 03:49:42', '2025-07-28 03:49:42'),
(269, 239, 41, 5.000, 'units', 0.00, 0.00, '', '2025-07-28 03:49:42', '2025-07-28 03:49:42'),
(270, 240, 48, 0.010, 'units', 0.00, 0.00, '', '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(271, 240, 43, 2.000, 'units', 0.00, 0.00, '', '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(272, 240, 46, 0.100, 'units', 0.00, 0.00, '', '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(273, 240, 41, 3.000, 'units', 0.00, 0.00, '', '2025-07-28 03:54:26', '2025-07-28 03:54:26'),
(274, 241, 48, 0.030, 'units', 0.00, 0.00, '', '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(275, 241, 46, 0.150, 'units', 0.00, 0.00, '', '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(276, 241, 42, 5.000, 'units', 0.00, 0.00, '', '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(277, 241, 41, 5.000, 'units', 0.00, 0.00, '', '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(278, 241, 49, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 03:58:54', '2025-07-28 03:58:54'),
(279, 242, 48, 0.030, 'units', 0.00, 0.00, '', '2025-07-28 04:02:26', '2025-07-28 04:02:26'),
(280, 242, 49, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:02:26', '2025-07-28 04:02:26'),
(281, 242, 41, 4.000, 'units', 0.00, 0.00, '', '2025-07-28 04:02:26', '2025-07-28 04:02:26'),
(282, 242, 42, 5.000, 'units', 0.00, 0.00, '', '2025-07-28 04:02:26', '2025-07-28 04:02:26'),
(283, 243, 48, 0.030, 'units', 0.00, 0.00, '', '2025-07-28 04:04:45', '2025-07-28 04:04:45'),
(284, 243, 49, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:04:45', '2025-07-28 04:04:45'),
(285, 244, 48, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(286, 244, 49, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:07:13', '2025-07-28 04:07:13'),
(287, 245, 48, 0.030, 'units', 0.00, 0.00, '', '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(288, 245, 49, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:09:27', '2025-07-28 04:09:27'),
(289, 246, 48, 0.100, 'units', 0.00, 0.00, '', '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(290, 246, 47, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:11:47', '2025-07-28 04:11:47'),
(291, 247, 48, 0.150, 'units', 0.00, 0.00, '', '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(292, 247, 47, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:13:26', '2025-07-28 04:13:26'),
(293, 248, 47, 0.300, 'units', 0.00, 0.00, '', '2025-07-28 04:15:59', '2025-07-28 04:15:59');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_notifications`
--

CREATE TABLE `retailer_notifications` (
  `id` int(11) NOT NULL,
  `notification_id` varchar(50) NOT NULL,
  `retailer_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_orders`
--

CREATE TABLE `retailer_orders` (
  `order_id` int(11) NOT NULL,
  `po_number` varchar(20) NOT NULL,
  `retailer_name` varchar(100) NOT NULL,
  `retailer_email` varchar(100) NOT NULL,
  `retailer_contact` varchar(20) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery` date DEFAULT NULL,
  `delivery_mode` varchar(20) DEFAULT 'delivery',
  `pickup_location` varchar(255) DEFAULT NULL,
  `pickup_date` date DEFAULT NULL,
  `status` enum('order','confirmed','shipped','delivered','ready-to-pickup','picked up','cancelled','completed','return_requested','returned') NOT NULL,
  `pickup_status` enum('order','confirmed','ready-to-pickup','picked up','cancelled','completed','return_requested','returned') NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('pending','partial','paid') NOT NULL DEFAULT 'pending',
  `consignment_term` int(11) DEFAULT 30,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `delivery_proof_photo` varchar(255) DEFAULT NULL,
  `pickup_person_name` varchar(100) DEFAULT NULL,
  `pickup_id_verified` tinyint(1) DEFAULT 0,
  `pickup_notes` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `archived_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_orders`
--

INSERT INTO `retailer_orders` (`order_id`, `po_number`, `retailer_name`, `retailer_email`, `retailer_contact`, `order_date`, `expected_delivery`, `delivery_mode`, `pickup_location`, `pickup_date`, `status`, `pickup_status`, `subtotal`, `tax`, `discount`, `total_amount`, `payment_status`, `consignment_term`, `notes`, `created_at`, `updated_at`, `delivery_proof_photo`, `pickup_person_name`, `pickup_id_verified`, `pickup_notes`, `user_id`, `archived_user_id`) VALUES
(400, 'RO-20250728-001', 'OTOP HUB UPLB', 'uplbtechnohub.otop@gmail.com', '+639673720540', '2025-07-28', '2025-07-31', 'delivery', '', '0000-00-00', 'completed', 'order', 9600.00, 0.00, 0.00, 9600.00, 'paid', 30, 'Order has been delivered', '2025-07-28 05:40:00', '2025-07-28 05:41:17', 'uploads/delivery_proofs/1753681230_03187eb70700444e0d4770572ca875b2-removebg-preview.png', NULL, 0, NULL, 21, NULL),
(401, 'RO-20250728-002', 'OTAP HUB EK', 'eldarthewizard@enchantedkigdom.com', '+639351266459', '2025-07-28', '2025-07-31', 'delivery', '', '0000-00-00', 'completed', 'order', 2850.00, 0.00, 0.00, 2850.00, 'paid', 30, 'Order has been delivered', '2025-07-28 05:49:48', '2025-07-28 05:50:57', 'uploads/delivery_proofs/1753681819_IMG_20250415_084943_922.jpg', NULL, 0, NULL, 35, NULL),
(402, 'RO-20250728-003', 'LIKHANG LAGUNA', 'benchlaxa5@gmail.com', '+639161029839', '2025-07-28', '2025-07-31', 'delivery', '', '0000-00-00', 'completed', 'order', 9200.00, 0.00, 0.00, 9200.00, 'paid', 30, 'Order has been delivered', '2025-07-28 05:57:01', '2025-07-28 05:58:30', 'uploads/delivery_proofs/1753682252_pinanalogo.png', NULL, 0, NULL, 32, NULL),
(403, 'RO-20250728-004', 'LIKHANG LAGUNA', 'benchlaxa5@gmail.com', '+639161029839', '2025-07-28', '2025-07-31', 'delivery', '', '0000-00-00', 'completed', 'order', 3900.00, 0.00, 0.00, 3900.00, 'paid', 30, 'Order has been delivered', '2025-07-28 06:00:46', '2025-07-28 06:02:11', 'uploads/delivery_proofs/1753682477_2_20241209_193426_0001.png', NULL, 0, NULL, 32, NULL);

--
-- Triggers `retailer_orders`
--
DELIMITER $$
CREATE TRIGGER `sync_pickup_status_before_update` BEFORE UPDATE ON `retailer_orders` FOR EACH ROW BEGIN
    -- If delivery_mode is pickup and status changed
    IF NEW.delivery_mode = 'pickup' THEN
        -- Map delivery status to pickup status
        CASE NEW.status
            WHEN 'shipped' THEN
                SET NEW.pickup_status = 'ready for pickup';
            WHEN 'delivered' THEN
                SET NEW.pickup_status = 'picked up';
            ELSE
                SET NEW.pickup_status = NEW.status;
        END CASE;
    END IF;
    
    -- If delivery_mode is pickup and pickup_status changed, update status accordingly
    IF NEW.delivery_mode = 'pickup' THEN
        CASE NEW.pickup_status
            WHEN 'ready for pickup' THEN
                SET NEW.status = 'shipped';
            WHEN 'picked up' THEN
                SET NEW.status = 'delivered';
            ELSE
                SET NEW.status = NEW.pickup_status;
        END CASE;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_deliveries`
--

CREATE TABLE `retailer_order_deliveries` (
  `delivery_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `estimated_arrival` datetime DEFAULT NULL,
  `actual_arrival` datetime DEFAULT NULL,
  `delivery_status` enum('pending','in_transit','out_for_delivery','delivered','failed','delayed') DEFAULT 'pending',
  `recipient_name` varchar(100) DEFAULT NULL,
  `signature_required` tinyint(1) DEFAULT 0,
  `signature_image` varchar(255) DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_delivery_issues`
--

CREATE TABLE `retailer_order_delivery_issues` (
  `issue_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `issue_type` enum('damaged','missing','wrong','quality','other') NOT NULL,
  `issue_severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `issue_description` text NOT NULL,
  `requested_action` enum('replacement','refund','partial_refund','inspection') NOT NULL,
  `issue_status` enum('reported','under_review','resolved','rejected') DEFAULT 'reported',
  `resolution_notes` text DEFAULT NULL,
  `reported_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_issues`
--

CREATE TABLE `retailer_order_issues` (
  `issue_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `issue_type` varchar(50) NOT NULL,
  `severity` varchar(20) NOT NULL DEFAULT 'medium',
  `description` text NOT NULL,
  `requested_action` varchar(50) NOT NULL,
  `resolution` text DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_items`
--

CREATE TABLE `retailer_order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `product_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_items`
--

INSERT INTO `retailer_order_items` (`item_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`, `product_name`) VALUES
(413, 400, 'DT111109', 40, 60.00, 2400.00, '2025-07-28 05:40:00', 'Piña Dishwashing Soap Large'),
(414, 400, 'PR381938', 40, 180.00, 7200.00, '2025-07-28 05:40:00', 'Pina Tuyo'),
(415, 401, 'PR685989', 30, 95.00, 2850.00, '2025-07-28 05:49:48', 'Pina Mangga'),
(416, 402, 'PR381938', 30, 180.00, 5400.00, '2025-07-28 05:57:01', 'Pina Tuyo'),
(417, 402, 'PR685989', 40, 95.00, 3800.00, '2025-07-28 05:57:01', 'Pina Mangga'),
(418, 403, 'BV954207', 30, 130.00, 3900.00, '2025-07-28 06:00:46', 'Pina Concentrate');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_item_payments`
--

CREATE TABLE `retailer_order_item_payments` (
  `item_payment_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `quantity_paid` int(11) NOT NULL,
  `quantity_unsold` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_item_payments`
--

INSERT INTO `retailer_order_item_payments` (`item_payment_id`, `payment_id`, `item_id`, `product_id`, `quantity_paid`, `quantity_unsold`, `created_at`) VALUES
(35, 61, 413, 'DT111109', 40, 0, '2025-07-28 13:41:01'),
(36, 61, 414, 'PR381938', 40, 0, '2025-07-28 13:41:01'),
(37, 62, 415, 'PR685989', 30, 0, '2025-07-28 13:50:39'),
(38, 63, 416, 'PR381938', 30, 0, '2025-07-28 13:58:03'),
(39, 63, 417, 'PR685989', 40, 0, '2025-07-28 13:58:03'),
(40, 64, 418, 'BV954207', 30, 0, '2025-07-28 14:01:56');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_item_verification`
--

CREATE TABLE `retailer_order_item_verification` (
  `verification_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verified_quantity` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_payments`
--

CREATE TABLE `retailer_order_payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `payment_notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_payments`
--

INSERT INTO `retailer_order_payments` (`payment_id`, `order_id`, `payment_method`, `payment_amount`, `payment_reference`, `payment_notes`, `created_at`) VALUES
(61, 400, 'cash', 9600.00, 'CASH-20250728074101', '', '2025-07-28 13:41:01'),
(62, 401, 'cash', 2850.00, 'CASH-20250728075039', '', '2025-07-28 13:50:39'),
(63, 402, 'cash', 9200.00, 'CASH-20250728075803', '', '2025-07-28 13:58:03'),
(64, 403, 'cash', 3900.00, 'CASH-20250728080156', '', '2025-07-28 14:01:56');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_returns`
--

CREATE TABLE `retailer_order_returns` (
  `return_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `return_reason` varchar(255) NOT NULL,
  `return_details` text DEFAULT NULL,
  `return_status` enum('requested','approved','rejected','completed') DEFAULT 'requested',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_returns`
--

INSERT INTO `retailer_order_returns` (`return_id`, `order_id`, `return_reason`, `return_details`, `return_status`, `requested_at`, `processed_at`) VALUES
(1, 308, 'Other', '', 'requested', '2025-04-29 08:29:20', NULL),
(2, 316, 'Expired', '', 'requested', '2025-04-29 11:23:51', NULL),
(3, 318, 'Quality Issues', '', 'requested', '2025-04-29 11:31:17', NULL),
(4, 307, 'Wrong Items', 'tgj5h', 'requested', '2025-05-02 03:40:42', NULL),
(5, 340, 'Damaged', '', 'requested', '2025-05-02 04:16:17', NULL),
(6, 305, 'Quality Issues', '', 'requested', '2025-05-05 11:19:34', NULL),
(7, 356, 'Quality Issues', '', 'requested', '2025-05-06 18:34:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_return_items`
--

CREATE TABLE `retailer_order_return_items` (
  `return_item_id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `return_quantity` int(11) NOT NULL,
  `return_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_return_items`
--

INSERT INTO `retailer_order_return_items` (`return_item_id`, `return_id`, `item_id`, `return_quantity`, `return_reason`) VALUES
(1, 1, 298, 1, 'Quality Issue'),
(2, 2, 306, 1, 'Quality Issue'),
(3, 3, 308, 1, 'Damaged'),
(4, 4, 297, 1, 'Wrong Item'),
(5, 5, 331, 20, 'Damaged'),
(6, 6, 295, 1, 'Quality Issue'),
(7, 7, 350, 1, 'Quality Issue');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_status_history`
--

CREATE TABLE `retailer_order_status_history` (
  `history_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` enum('order','confirmed','shipped','delivered','cancelled','ready-to-pickup','picked up','completed','return_requested','returned') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_hours` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_status_history`
--

INSERT INTO `retailer_order_status_history` (`history_id`, `order_id`, `status`, `notes`, `created_at`, `delivery_hours`) VALUES
(587, 286, 'order', 'Order created', '2025-04-28 12:46:50', NULL),
(588, 286, 'confirmed', 'Order confirmed by admin', '2025-04-28 12:46:56', NULL),
(672, 309, 'picked up', 'Order picked up by Siex', '2025-04-29 07:09:00', NULL),
(673, 310, 'order', 'Order created', '2025-04-29 07:37:06', NULL),
(674, 310, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 07:37:27', NULL),
(675, 310, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 07:37:33', 'Morning (7-12 am)'),
(676, 310, 'delivered', 'Order has been delivered', '2025-04-29 07:37:44', NULL),
(678, 310, 'completed', 'Order verified and completed by retailer', '2025-04-29 08:28:13', NULL),
(679, 308, 'return_requested', 'Return requested: Other', '2025-04-29 08:29:20', NULL),
(680, 312, 'order', 'Order created', '2025-04-29 08:50:15', NULL),
(681, 312, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 08:51:08', NULL),
(682, 312, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 08:51:14', 'Morning (7-12 am)'),
(683, 312, 'delivered', 'Order has been delivered', '2025-04-29 08:51:33', NULL),
(684, 313, 'order', 'Order created', '2025-04-29 09:30:24', NULL),
(685, 313, 'cancelled', 'Order cancelled by user', '2025-04-29 09:51:00', NULL),
(686, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 09:51:04', NULL),
(687, 313, 'cancelled', 'Order cancelled by user', '2025-04-29 09:51:14', NULL),
(688, 314, 'order', 'Order created', '2025-04-29 10:00:03', NULL),
(689, 307, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 10:00:29', NULL),
(690, 307, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 10:00:36', NULL),
(691, 307, 'picked up', 'Order picked up by Sevence', '2025-04-29 10:00:53', NULL),
(692, 315, 'order', 'Order created', '2025-04-29 10:02:21', NULL),
(693, 315, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 10:02:52', NULL),
(694, 315, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 10:02:58', 'Morning (7-12 am)'),
(695, 315, 'delivered', 'Order has been delivered', '2025-04-29 10:03:03', NULL),
(696, 307, 'confirmed', 'Order confirmed by admin', '2025-04-29 10:05:42', NULL),
(697, 307, 'confirmed', 'Order confirmed by admin', '2025-04-29 10:05:42', NULL),
(698, 307, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 10:05:50', NULL),
(699, 316, 'order', 'Order created', '2025-04-29 10:14:18', NULL),
(700, 316, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 10:14:49', NULL),
(701, 316, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 10:14:54', NULL),
(702, 316, 'picked up', 'Order picked up by Van', '2025-04-29 10:14:59', NULL),
(703, 317, 'order', 'Order created', '2025-04-29 10:50:35', NULL),
(704, 318, 'order', 'Order created', '2025-04-29 10:59:18', NULL),
(705, 315, 'completed', 'Order verified and completed by retailer', '2025-04-29 11:22:55', NULL),
(706, 316, 'return_requested', 'Return requested: Expired', '2025-04-29 11:23:51', NULL),
(707, 318, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 11:30:28', NULL),
(708, 318, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 11:30:32', NULL),
(709, 318, 'picked up', 'Order picked up by Tuh', '2025-04-29 11:30:54', NULL),
(710, 318, 'return_requested', 'Return requested: Quality Issues', '2025-04-29 11:31:17', NULL),
(711, 319, 'order', 'Order created', '2025-04-29 11:38:13', NULL),
(712, 320, 'order', 'Order created', '2025-04-29 12:00:36', NULL),
(713, 319, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 12:17:10', NULL),
(714, 319, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 12:17:16', 'Morning (7-12 am)'),
(715, 319, 'delivered', 'Order has been delivered', '2025-04-29 12:17:25', NULL),
(716, 321, 'order', 'Order created', '2025-04-29 12:26:34', NULL),
(718, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:06:23', NULL),
(719, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 13:06:27', NULL),
(720, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:06:30', NULL),
(721, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 13:15:20', NULL),
(722, 319, 'completed', 'Order verified and completed by retailer', '2025-04-29 13:29:19', NULL),
(723, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 13:29:26', NULL),
(724, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:29:29', NULL),
(725, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 13:52:31', NULL),
(726, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:52:34', NULL),
(727, 313, 'cancelled', 'Order cancelled by retailer', '2025-04-29 14:31:08', NULL),
(728, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 14:31:17', NULL),
(729, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 14:47:25', NULL),
(730, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 14:47:29', NULL),
(731, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 14:56:28', NULL),
(732, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 14:56:32', NULL),
(733, 313, 'cancelled', 'Order cancelled by retailer', '2025-04-29 15:03:12', NULL),
(734, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 15:03:20', NULL),
(735, 323, 'order', 'Order created', '2025-04-30 04:32:10', NULL),
(736, 313, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:32:20', NULL),
(737, 323, 'cancelled', 'Order cancelled by retailer', '2025-04-30 04:34:15', NULL),
(738, 323, 'order', 'Order placed again from cancelled order', '2025-04-30 04:34:31', NULL),
(739, 323, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:34:49', NULL),
(740, 324, 'order', 'Order created', '2025-04-30 04:35:16', NULL),
(741, 325, 'order', 'Order created', '2025-04-30 04:35:27', NULL),
(742, 325, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:35:40', NULL),
(743, 325, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 04:35:50', 'Morning (7-12 am)'),
(744, 326, 'order', 'Order created', '2025-04-30 04:36:16', NULL),
(745, 324, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:36:27', NULL),
(746, 324, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 04:36:36', NULL),
(748, 326, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:37:24', NULL),
(749, 326, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 04:37:30', NULL),
(750, 326, 'picked up', 'Order picked up by Siex', '2025-04-30 04:37:40', NULL),
(751, 328, 'order', 'Order created', '2025-04-30 04:52:37', NULL),
(753, 329, 'order', 'Order created', '2025-04-30 05:01:28', NULL),
(754, 328, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 05:01:50', NULL),
(755, 330, 'order', 'Order created', '2025-04-30 05:03:00', NULL),
(756, 331, 'order', 'Order created', '2025-04-30 05:03:10', NULL),
(757, 330, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 05:03:37', NULL),
(758, 330, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 05:03:47', NULL),
(759, 330, 'picked up', 'Order picked up by Tuh', '2025-04-30 05:06:05', NULL),
(760, 330, 'completed', 'Order verified and completed by retailer', '2025-04-30 05:29:01', NULL),
(761, 326, 'completed', 'Order verified and completed by retailer', '2025-04-30 05:31:54', NULL),
(762, 321, 'order', 'Order placed again from cancelled order', '2025-04-30 05:33:07', NULL),
(763, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-30 05:33:14', NULL),
(764, 331, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 05:34:40', NULL),
(765, 331, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 05:34:45', NULL),
(766, 331, 'picked up', 'Order picked up by Tuh', '2025-04-30 05:35:01', NULL),
(767, 293, 'completed', 'Order verified and completed by retailer', '2025-04-30 05:37:56', NULL),
(768, 328, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 06:38:57', 'Morning (7-12 am)'),
(769, 328, 'delivered', 'Order has been delivered', '2025-04-30 06:39:15', NULL),
(770, 328, 'completed', 'Order verified and completed by retailer', '2025-04-30 06:40:10', NULL),
(771, 331, 'completed', 'Order verified and completed by retailer', '2025-04-30 06:42:54', NULL),
(772, 324, 'picked up', 'Order picked up by Siex', '2025-04-30 07:20:13', NULL),
(773, 324, 'completed', 'Order verified and completed by retailer', '2025-04-30 07:20:22', NULL),
(776, 302, 'completed', 'Order verified and completed by retailer', '2025-04-30 08:39:39', NULL),
(777, 329, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 09:15:15', NULL),
(778, 329, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 09:15:32', 'Morning (7-12 am)'),
(779, 329, 'delivered', 'Order has been delivered', '2025-04-30 09:15:48', NULL),
(788, 329, 'completed', 'Order completed and inventory updated', '2025-04-30 09:22:33', NULL),
(789, 332, 'order', 'Order created', '2025-04-30 11:07:42', NULL),
(790, 332, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 11:08:37', NULL),
(791, 332, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 11:08:46', 'Morning (7-12 am)'),
(792, 332, 'delivered', 'Order has been delivered', '2025-04-30 11:08:58', NULL),
(793, 332, 'completed', 'Order completed and inventory updated', '2025-04-30 11:10:13', NULL),
(794, 333, 'order', 'Order created', '2025-04-30 11:26:21', NULL),
(795, 333, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 11:27:00', NULL),
(796, 333, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 11:27:20', NULL),
(797, 333, 'picked up', 'Order picked up by Siex', '2025-04-30 11:27:38', NULL),
(798, 333, 'completed', 'Order completed and inventory updated', '2025-04-30 11:28:45', NULL),
(799, 314, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 12:02:25', NULL),
(800, 314, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 12:02:33', NULL),
(801, 314, 'picked up', 'Order picked up by Sevence', '2025-04-30 12:02:42', NULL),
(802, 314, 'completed', 'Order completed and inventory updated', '2025-04-30 12:03:11', NULL),
(803, 312, 'completed', 'Order completed and inventory updated', '2025-04-30 13:24:10', NULL),
(804, 334, 'order', 'Order created', '2025-04-30 13:26:13', NULL),
(805, 334, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 13:26:43', NULL),
(806, 334, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 13:26:55', NULL),
(807, 334, 'picked up', 'Order picked up by Fohr', '2025-04-30 13:27:06', NULL),
(808, 334, 'completed', 'Order completed and inventory updated', '2025-04-30 13:27:20', NULL),
(809, 286, 'completed', 'Order completed and inventory updated', '2025-05-01 08:47:23', NULL),
(810, 335, 'order', 'Order created', '2025-05-01 08:48:19', NULL),
(811, 335, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:48:32', NULL),
(812, 335, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-01 08:48:40', NULL),
(813, 335, 'picked up', 'Order picked up by Fyave', '2025-05-01 08:48:46', NULL),
(814, 335, 'completed', 'Order completed and inventory updated', '2025-05-01 08:49:02', NULL),
(815, 336, 'order', 'Order created', '2025-05-01 08:49:56', NULL),
(816, 336, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:50:06', NULL),
(817, 305, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:50:11', NULL),
(818, 336, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-01 08:50:30', 'Morning (7-12 am)'),
(819, 336, 'delivered', 'Order has been delivered', '2025-05-01 08:50:42', NULL),
(820, 336, 'completed', 'Order completed and inventory updated', '2025-05-01 08:50:55', NULL),
(821, 337, 'order', 'Order created', '2025-05-01 08:51:38', NULL),
(822, 337, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:51:52', NULL),
(823, 337, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-01 08:52:03', NULL),
(824, 337, 'picked up', 'Order picked up by Sevence', '2025-05-01 08:52:11', NULL),
(825, 337, 'completed', 'Order completed and inventory updated', '2025-05-01 08:52:22', NULL),
(826, 306, 'completed', 'Order completed and inventory updated', '2025-05-01 08:55:14', NULL),
(827, 338, 'order', 'Order created', '2025-05-01 09:28:51', NULL),
(828, 338, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 09:29:13', NULL),
(829, 338, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-01 09:29:23', NULL),
(830, 338, 'picked up', 'Order picked up by Sevence', '2025-05-01 09:29:30', NULL),
(831, 338, 'completed', 'Order completed and inventory updated', '2025-05-01 09:29:46', NULL),
(832, 317, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 09:35:17', NULL),
(833, 317, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-01 09:35:27', 'Morning (7-12 am)'),
(834, 317, 'delivered', 'Order has been delivered', '2025-05-01 09:35:34', NULL),
(835, 317, 'completed', 'Order completed and inventory updated', '2025-05-01 09:35:51', NULL),
(836, 339, 'order', 'Order created', '2025-05-02 03:37:23', NULL),
(837, 339, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-02 03:37:39', NULL),
(838, 339, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-02 03:37:56', NULL),
(839, 339, 'picked up', 'Order picked up by Sevence', '2025-05-02 03:38:23', NULL),
(840, 339, 'completed', 'Order completed and inventory updated', '2025-05-02 03:38:45', NULL),
(841, 307, 'picked up', 'Order picked up by Sevence', '2025-05-02 03:39:57', NULL),
(842, 307, 'return_requested', 'Return requested: Wrong Items', '2025-05-02 03:40:42', NULL),
(843, 340, 'order', 'Order created', '2025-05-02 04:11:09', NULL),
(844, 340, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-02 04:12:53', NULL),
(845, 340, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-02 04:13:39', NULL),
(846, 340, 'picked up', 'Order picked up by mmmm', '2025-05-02 04:15:29', NULL),
(847, 340, 'return_requested', 'Return requested: Damaged', '2025-05-02 04:16:17', NULL),
(848, 340, 'picked up', 'Return request resolved: bb', '2025-05-02 13:34:32', NULL),
(849, 307, 'picked up', 'Return request resolved: bb', '2025-05-02 13:36:25', NULL),
(850, 307, 'completed', 'Order completed and inventory updated', '2025-05-02 14:23:05', NULL),
(852, 320, 'confirmed', 'Order has been confirmed', '2025-05-02 15:45:49', NULL),
(853, 318, 'picked up', 'Return request resolved: rhrey', '2025-05-02 16:33:04', NULL),
(854, 330, '', 'Payment processed via Cash. Amount: ₱130.00. Reference: CASH-20250503142430', '2025-05-03 12:24:30', NULL),
(855, 330, '', 'Payment processed via Mobile. Amount: ₱130.00. Reference: 38384932', '2025-05-03 12:24:40', NULL),
(856, 330, '', 'Payment processed via Mobile. Amount: ₱130.00. Reference: 53872', '2025-05-03 12:24:45', NULL),
(857, 331, '', 'Payment processed via Mobile. Amount: ₱20.00. Reference: 435', '2025-05-03 12:25:02', NULL),
(858, 331, '', 'Payment processed via Cash. Amount: ₱20.00. Reference: CASH-20250503142616', '2025-05-03 12:26:16', NULL),
(859, 331, '', 'Payment processed via Cash. Amount: ₱20.00. Reference: CASH-20250503142616', '2025-05-03 12:26:16', NULL),
(860, 330, '', 'Payment processed via Cash. Amount: ₱130.00. Reference: CASH-20250503142814', '2025-05-03 12:28:14', NULL),
(861, 333, '', 'Payment processed via Cash. Amount: ₱60.00. Reference: CASH-20250503143008', '2025-05-03 12:30:08', NULL),
(862, 333, '', 'Payment processed via Mobile. Amount: ₱60.00. Reference: 3535532', '2025-05-03 12:30:18', NULL),
(863, 336, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503160255', '2025-05-03 14:02:55', NULL),
(864, 336, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503160301', '2025-05-03 14:03:01', NULL),
(865, 330, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503160335', '2025-05-03 14:03:35', NULL),
(866, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503160455', '2025-05-03 14:04:55', NULL),
(867, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503160520', '2025-05-03 14:05:20', NULL),
(868, 335, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503160826', '2025-05-03 14:08:26', NULL),
(869, 293, '', 'Partial payment made via Mobile. Amount: ₱180.00. Reference: 12345678910', '2025-05-03 14:34:09', NULL),
(870, 293, '', 'Partial payment made via Mobile. Amount: ₱180.00. Reference: 12345678910', '2025-05-03 14:34:09', NULL),
(871, 332, '', 'Partial payment made via Mobile. Amount: ₱130.00. Reference: 69', '2025-05-03 14:35:43', NULL),
(872, 332, '', 'Partial payment made via Mobile. Amount: ₱130.00. Reference: 69', '2025-05-03 14:35:43', NULL),
(873, 329, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250503163635', '2025-05-03 14:36:35', NULL),
(874, 329, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250503163635', '2025-05-03 14:36:35', NULL),
(875, 328, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503164323', '2025-05-03 14:43:23', NULL),
(876, 328, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503164323', '2025-05-03 14:43:23', NULL),
(877, 324, '', 'Partial payment made via Cash. Amount: ₱50.00. Reference: CASH-20250503165242', '2025-05-03 14:52:42', NULL),
(878, 324, '', 'Partial payment made via Cash. Amount: ₱50.00. Reference: CASH-20250503165242', '2025-05-03 14:52:42', NULL),
(879, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503165454', '2025-05-03 14:54:54', NULL),
(880, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503165454', '2025-05-03 14:54:54', NULL),
(881, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173232', '2025-05-03 15:32:36', NULL),
(882, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173237', '2025-05-03 15:32:37', NULL),
(883, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173237', '2025-05-03 15:32:37', NULL),
(884, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173237', '2025-05-03 15:32:37', NULL),
(885, 332, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173258', '2025-05-03 15:32:58', NULL),
(886, 332, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173258', '2025-05-03 15:32:58', NULL),
(887, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503174534', '2025-05-03 15:45:34', NULL),
(888, 339, '', 'Partial payment made via Cash. Amount: ₱1,950.00. Reference: CASH-20250503180703', '2025-05-03 16:07:03', NULL),
(889, 338, '', 'Partial payment made via Cash. Amount: ₱1,950.00. Reference: CASH-20250503180735', '2025-05-03 16:07:35', NULL),
(890, 329, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250503184529', '2025-05-03 16:45:29', NULL),
(891, 341, 'order', 'Order created', '2025-05-03 16:58:15', NULL),
(892, 341, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-03 16:58:31', NULL),
(893, 341, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-03 16:58:39', NULL),
(894, 341, 'picked up', 'Order picked up by Siex', '2025-05-03 16:58:47', NULL),
(895, 341, 'completed', 'Order completed and inventory updated', '2025-05-03 16:59:04', NULL),
(896, 341, '', 'Partial payment made via Cash. Amount: ₱320.00. Reference: CASH-20250503185930', '2025-05-03 16:59:30', NULL),
(897, 341, '', 'Partial payment made via Cash. Amount: ₱320.00. Reference: CASH-20250503192627', '2025-05-03 17:26:27', NULL),
(898, 323, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-03 18:08:55', 'Morning (7-12 am)'),
(899, 305, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-03 18:16:21', NULL),
(900, 335, '', 'Partial payment made via Mobile. Amount: ₱60.00. Reference: 74821749812', '2025-05-03 18:17:33', NULL),
(901, 313, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-03 18:28:00', 'Morning (7-12 am)'),
(902, 320, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-03 18:29:24', 'Morning (7-12 am)'),
(903, 305, 'picked up', 'Order picked up by Fyave', '2025-05-03 19:22:16', NULL),
(904, 335, '', 'Payment status updated to: paid', '2025-05-04 07:29:11', NULL),
(905, 338, '', 'Payment status updated to: paid', '2025-05-04 07:33:09', NULL),
(906, 333, '', 'Payment status updated to: paid', '2025-05-04 07:42:19', NULL),
(907, 331, '', 'Payment status updated to: paid', '2025-05-04 09:59:52', NULL),
(908, 339, '', 'Payment status updated to: paid', '2025-05-04 10:09:30', NULL),
(909, 293, '', 'Payment status updated to: paid', '2025-05-04 10:52:45', NULL),
(910, 293, '', 'Partial payment made via Cash. Amount: ₱780.00. Reference: CASH-20250505110340', '2025-05-05 09:03:40', NULL),
(911, 305, 'return_requested', 'Return requested: Quality Issues', '2025-05-05 11:19:34', NULL),
(912, 341, '', 'Payment status updated to: paid', '2025-05-05 14:02:57', NULL),
(915, 342, 'order', 'Order created', '2025-05-05 16:24:05', NULL),
(916, 342, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-05 16:24:22', NULL),
(929, 353, 'order', 'Order created', '2025-05-06 09:35:13', NULL),
(933, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:53:18', NULL),
(934, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:53:22', NULL),
(935, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:53:43', NULL),
(936, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:54:05', NULL),
(937, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:54:07', NULL),
(938, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:54:08', NULL),
(939, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:55:22', NULL),
(940, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:55:25', NULL),
(941, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:58:52', NULL),
(942, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:58:56', NULL),
(943, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:59:26', NULL),
(944, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:59:28', NULL),
(945, 309, 'completed', 'Order completed and inventory updated', '2025-05-06 09:59:39', NULL),
(946, 354, 'order', 'Order created', '2025-05-06 10:49:28', NULL),
(947, 330, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250506130225', '2025-05-06 11:02:25', NULL),
(948, 318, 'completed', 'Order completed and inventory updated', '2025-05-06 11:03:32', NULL),
(949, 318, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250506130345', '2025-05-06 11:03:45', NULL),
(950, 318, '', 'Payment status updated to: paid', '2025-05-06 11:04:02', NULL),
(952, 356, 'order', 'Order created', '2025-05-06 18:31:36', NULL),
(953, 356, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-06 18:32:45', NULL),
(954, 356, 'shipped', 'Order has been shipped. Delivery: Evening (6-8 pm)', '2025-05-06 18:33:31', 'Evening (6-8 pm)'),
(955, 356, 'delivered', 'Order has been delivered', '2025-05-06 18:33:43', NULL),
(956, 342, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-06 18:33:47', NULL),
(957, 356, 'return_requested', 'Return requested: Quality Issues', '2025-05-06 18:34:20', NULL),
(958, 356, 'delivered', 'Return request resolved: test', '2025-05-06 18:37:38', NULL),
(959, 356, 'completed', 'Order completed and inventory updated', '2025-05-06 18:37:52', NULL),
(960, 356, '', 'Partial payment made via Cash. Amount: ₱260.00. Reference: CASH-20250506203802', '2025-05-06 18:38:02', NULL),
(961, 353, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-06 19:00:15', NULL),
(962, 353, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-06 19:00:30', NULL),
(963, 353, 'picked up', 'Order picked up by Siex', '2025-05-06 19:00:59', NULL),
(965, 336, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250507005256', '2025-05-06 22:52:56', NULL),
(966, 286, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250507010001', '2025-05-06 23:00:01', NULL),
(967, 357, 'order', 'Order created', '2025-05-06 23:18:05', NULL),
(968, 357, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-06 23:18:38', NULL),
(969, 357, 'shipped', 'Order has been shipped. Delivery: Afternoon (12-6 pm)', '2025-05-06 23:19:07', 'Afternoon (12-6 pm)'),
(970, 357, 'delivered', 'Order has been delivered', '2025-05-06 23:19:24', NULL),
(971, 357, 'completed', 'Order completed and inventory updated', '2025-05-06 23:19:40', NULL),
(972, 329, '', 'Payment status updated to: paid', '2025-05-15 03:54:27', NULL),
(973, 324, '', 'Payment status updated to: paid', '2025-05-15 03:54:34', NULL),
(974, 293, '', 'Payment status updated to: paid', '2025-05-15 03:54:39', NULL),
(975, 356, '', 'Payment status updated to: paid', '2025-05-15 03:54:44', NULL),
(976, 354, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-15 05:34:33', NULL),
(977, 325, 'delivered', 'Order has been delivered', '2025-05-15 07:07:44', NULL),
(978, 354, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-21 12:10:55', 'Morning (7-12 am)'),
(979, 336, '', 'Payment status updated to: paid', '2025-05-25 06:32:37', NULL),
(980, 330, '', 'Payment status updated to: paid', '2025-05-25 06:32:41', NULL),
(981, 332, '', 'Payment status updated to: paid', '2025-05-25 06:32:44', NULL),
(982, 286, '', 'Payment status updated to: paid', '2025-05-25 06:32:47', NULL),
(987, 359, 'order', 'Order created', '2025-06-20 06:23:09', NULL),
(988, 359, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-06-20 06:27:37', NULL),
(989, 357, '', 'Partial payment made via Mobile. Amount: ₱650.00. Reference: 121', '2025-06-20 06:30:42', NULL),
(990, 357, '', 'Payment status updated to: paid', '2025-06-20 06:31:52', NULL),
(991, 360, 'order', 'Order created', '2025-07-10 14:31:26', NULL),
(994, 360, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-10 15:08:52', NULL),
(1005, 363, 'order', 'Order created', '2025-07-10 15:52:51', NULL),
(1007, 363, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-10 15:54:58', NULL),
(1010, 366, 'order', 'Order created', '2025-07-10 15:58:59', NULL),
(1012, 367, 'order', 'Order created', '2025-07-10 16:15:35', NULL),
(1013, 360, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-10 16:49:52', 'Morning (7-12 am)'),
(1014, 360, 'delivered', 'Order has been delivered', '2025-07-10 16:50:05', NULL),
(1015, 368, 'order', 'Order created', '2025-07-11 06:32:25', NULL),
(1016, 368, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-11 06:33:21', NULL),
(1017, 360, 'completed', 'Order completed and inventory updated', '2025-07-20 05:29:28', NULL),
(1018, 360, '', 'Partial payment made via Cash. Amount: ₱24,900.00. Reference: CASH-20250720072955', '2025-07-20 05:29:55', NULL),
(1019, 360, '', 'Payment status updated to: paid', '2025-07-20 05:30:21', NULL),
(1020, 369, 'order', 'Order created', '2025-07-20 09:58:21', NULL),
(1021, 369, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-20 09:58:35', NULL),
(1022, 369, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-20 09:58:41', 'Morning (7-12 am)'),
(1023, 369, 'delivered', 'Order has been delivered', '2025-07-20 09:58:49', NULL),
(1024, 369, 'completed', 'Order completed and inventory updated', '2025-07-20 10:00:35', NULL),
(1025, 369, '', 'Partial payment made via Cash. Amount: ₱14,370.00. Reference: CASH-20250720120111', '2025-07-20 10:01:11', NULL),
(1026, 369, '', 'Payment status updated to: paid', '2025-07-20 10:01:28', NULL),
(1027, 370, 'order', 'Order created', '2025-07-20 14:11:22', NULL),
(1028, 371, 'order', 'Order created', '2025-07-20 15:16:06', NULL),
(1029, 370, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-20 15:16:41', NULL),
(1030, 370, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-20 15:16:48', 'Morning (7-12 am)'),
(1031, 370, 'delivered', 'Order has been delivered', '2025-07-20 15:16:54', NULL),
(1032, 372, 'order', 'Order created', '2025-07-20 15:17:26', NULL),
(1033, 371, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-20 15:17:33', NULL),
(1034, 371, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-20 15:17:43', 'Morning (7-12 am)'),
(1035, 371, 'delivered', 'Order has been delivered', '2025-07-20 15:17:49', NULL),
(1036, 371, 'completed', 'Order completed and inventory updated', '2025-07-20 15:18:01', NULL),
(1037, 371, '', 'Partial payment made via Cash. Amount: ₱16,080.00. Reference: CASH-20250720171818', '2025-07-20 15:18:18', NULL),
(1038, 371, '', 'Payment status updated to: paid', '2025-07-20 15:18:30', NULL),
(1039, 373, 'order', 'Order created', '2025-07-21 02:20:49', NULL),
(1042, 375, 'order', 'Order created', '2025-07-23 10:11:01', NULL),
(1043, 375, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-23 10:29:47', NULL),
(1044, 376, 'order', 'Order created', '2025-07-23 10:33:34', NULL),
(1045, 377, 'order', 'Order created', '2025-07-23 10:55:38', NULL),
(1046, 378, 'order', 'Order created', '2025-07-23 11:26:02', NULL),
(1047, 379, 'order', 'Order created', '2025-07-24 17:37:00', NULL),
(1048, 380, 'order', 'Order created', '2025-07-24 19:12:01', NULL),
(1049, 381, 'order', 'Order created', '2025-07-24 19:20:24', NULL),
(1050, 380, 'cancelled', 'Order cancelled by retailer', '2025-07-24 19:49:15', NULL),
(1051, 379, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-24 20:08:52', NULL),
(1052, 381, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-24 20:09:51', NULL),
(1053, 381, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-24 20:15:51', 'Morning (7-12 am)'),
(1054, 381, 'delivered', 'Order has been delivered', '2025-07-24 20:20:44', NULL),
(1055, 379, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-24 20:46:36', 'Morning (7-12 am)'),
(1056, 382, 'order', 'Order created', '2025-07-24 20:51:06', NULL),
(1057, 382, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-24 20:53:09', NULL),
(1058, 382, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-24 20:53:41', 'Morning (7-12 am)'),
(1059, 383, 'order', 'Order created', '2025-07-24 21:02:01', NULL),
(1060, 383, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-24 21:02:33', NULL),
(1061, 382, 'delivered', 'Order has been delivered', '2025-07-24 21:03:17', NULL),
(1062, 383, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-24 21:09:15', 'Morning (7-12 am)'),
(1063, 379, 'delivered', 'Order has been delivered', '2025-07-24 21:10:00', NULL),
(1064, 384, 'order', 'Order created', '2025-07-24 21:26:34', NULL),
(1065, 384, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-24 21:26:55', NULL),
(1066, 385, 'order', 'Order created', '2025-07-25 15:39:20', NULL),
(1067, 385, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-25 15:39:41', NULL),
(1068, 385, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-25 15:43:15', 'Morning (7-12 am)'),
(1069, 386, 'order', 'Order created', '2025-07-25 15:54:07', NULL),
(1070, 386, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-25 15:54:22', NULL),
(1071, 386, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-25 15:55:03', 'Morning (7-12 am)'),
(1072, 386, 'delivered', 'Order has been delivered', '2025-07-25 15:56:07', NULL),
(1073, 376, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-25 17:05:03', NULL),
(1074, 377, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-25 17:05:13', NULL),
(1075, 387, 'order', 'Order created', '2025-07-25 17:06:14', NULL),
(1076, 337, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250726212835', '2025-07-26 19:28:35', NULL),
(1077, 337, '', 'Payment status updated to: paid', '2025-07-26 19:28:49', NULL),
(1078, 337, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250726212912', '2025-07-26 19:29:13', NULL),
(1081, 389, 'order', 'Order created', '2025-07-27 06:10:47', NULL),
(1082, 389, 'cancelled', 'Order cancelled by retailer', '2025-07-27 06:13:10', NULL),
(1083, 390, 'order', 'Order created', '2025-07-27 06:54:57', NULL),
(1084, 391, 'order', 'Order created', '2025-07-27 12:47:47', NULL),
(1085, 391, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-27 12:51:28', NULL),
(1086, 391, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-27 12:51:36', 'Morning (7-12 am)'),
(1087, 391, 'delivered', 'Order has been delivered', '2025-07-27 12:51:47', NULL),
(1088, 392, 'order', 'Order created', '2025-07-27 12:55:03', NULL),
(1089, 390, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-27 12:55:13', NULL),
(1090, 392, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-27 12:55:27', NULL),
(1091, 392, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-27 12:55:39', 'Morning (7-12 am)'),
(1092, 392, 'delivered', 'Order has been delivered', '2025-07-27 12:56:00', NULL),
(1093, 392, 'completed', 'Order completed and inventory updated', '2025-07-27 12:56:23', NULL),
(1094, 392, '', 'Partial payment made via Cash. Amount: ₱15,540.00. Reference: CASH-20250727145733', '2025-07-27 12:57:33', NULL),
(1095, 392, '', 'Payment status updated to: paid', '2025-07-27 12:57:49', NULL),
(1096, 393, 'order', 'Order created', '2025-07-27 18:31:45', NULL),
(1140, 400, 'order', 'Order created', '2025-07-28 05:40:00', NULL),
(1141, 400, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-28 05:40:12', NULL),
(1142, 400, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-28 05:40:22', 'Morning (7-12 am)'),
(1143, 400, 'delivered', 'Order has been delivered', '2025-07-28 05:40:30', NULL),
(1144, 400, 'completed', 'Order completed and inventory updated', '2025-07-28 05:40:45', NULL),
(1145, 400, '', 'Partial payment made via Cash. Amount: ₱9,600.00. Reference: CASH-20250728074101', '2025-07-28 05:41:01', NULL),
(1146, 400, '', 'Payment status updated to: paid', '2025-07-28 05:41:18', NULL),
(1147, 401, 'order', 'Order created', '2025-07-28 05:49:48', NULL),
(1148, 401, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-28 05:50:01', NULL),
(1149, 401, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-28 05:50:08', 'Morning (7-12 am)'),
(1150, 401, 'delivered', 'Order has been delivered', '2025-07-28 05:50:19', NULL),
(1151, 401, 'completed', 'Order completed and inventory updated', '2025-07-28 05:50:32', NULL),
(1152, 401, '', 'Partial payment made via Cash. Amount: ₱2,850.00. Reference: CASH-20250728075039', '2025-07-28 05:50:39', NULL),
(1153, 401, '', 'Payment status updated to: paid', '2025-07-28 05:50:57', NULL),
(1154, 402, 'order', 'Order created', '2025-07-28 05:57:01', NULL),
(1155, 402, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-28 05:57:11', NULL),
(1156, 402, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-28 05:57:18', 'Morning (7-12 am)'),
(1157, 402, 'delivered', 'Order has been delivered', '2025-07-28 05:57:32', NULL),
(1158, 402, 'completed', 'Order completed and inventory updated', '2025-07-28 05:57:45', NULL),
(1159, 402, '', 'Partial payment made via Cash. Amount: ₱9,200.00. Reference: CASH-20250728075803', '2025-07-28 05:58:03', NULL),
(1160, 402, '', 'Payment status updated to: paid', '2025-07-28 05:58:30', NULL),
(1161, 403, 'order', 'Order created', '2025-07-28 06:00:46', NULL),
(1162, 403, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-07-28 06:00:58', NULL),
(1163, 403, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-07-28 06:01:06', 'Morning (7-12 am)'),
(1164, 403, 'delivered', 'Order has been delivered', '2025-07-28 06:01:17', NULL),
(1165, 403, 'completed', 'Order completed and inventory updated', '2025-07-28 06:01:39', NULL),
(1166, 403, '', 'Partial payment made via Cash. Amount: ₱3,900.00. Reference: CASH-20250728080156', '2025-07-28 06:01:56', NULL),
(1167, 403, '', 'Payment status updated to: paid', '2025-07-28 06:02:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `retailer_payments`
--

CREATE TABLE `retailer_payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` enum('cash','online') NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `payment_platform` varchar(50) DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `change_amount` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_payment_items`
--

CREATE TABLE `retailer_payment_items` (
  `item_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_pickup_orders`
--

CREATE TABLE `retailer_pickup_orders` (
  `pickup_order_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `retailer_name` varchar(100) NOT NULL,
  `retailer_email` varchar(100) DEFAULT NULL,
  `retailer_contact` varchar(50) DEFAULT NULL,
  `order_date` datetime NOT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `pickup_date` date DEFAULT NULL,
  `pickup_status` enum('order','confirmed','ready','picked up','cancelled') DEFAULT 'order',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_pickup_status_history`
--

CREATE TABLE `retailer_pickup_status_history` (
  `history_id` int(11) NOT NULL,
  `pickup_order_id` int(11) NOT NULL,
  `pickup_status` enum('order','confirmed','ready','picked up','cancelled') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_profiles`
--

CREATE TABLE `retailer_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `birthday` date NOT NULL,
  `age` int(11) DEFAULT NULL,
  `nationality` varchar(100) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `house_number` varchar(255) DEFAULT NULL,
  `address_notes` text DEFAULT NULL,
  `business_address` text NOT NULL,
  `phone` varchar(50) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `tiktok` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `gov_id_type` varchar(100) NOT NULL,
  `gov_id_file_path` varchar(255) NOT NULL,
  `business_doc_type` varchar(100) DEFAULT NULL,
  `business_doc_file_path` varchar(255) DEFAULT NULL,
  `approval_status` varchar(20) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_profiles`
--

INSERT INTO `retailer_profiles` (`id`, `user_id`, `first_name`, `last_name`, `birthday`, `age`, `nationality`, `business_name`, `business_type`, `province`, `city`, `barangay`, `house_number`, `address_notes`, `business_address`, `phone`, `profile_image`, `facebook`, `instagram`, `tiktok`, `created_at`, `updated_at`, `gov_id_type`, `gov_id_file_path`, `business_doc_type`, `business_doc_file_path`, `approval_status`) VALUES
(10, 12, 'no', 'yes', '2009-10-20', 15, 'Filipino', 'Storey', '0', NULL, NULL, NULL, NULL, 'Dayap', 'Dayap', '+639560830322', NULL, 'Eighth Targaryen', '', '', '2025-04-10 11:42:52', '2025-07-27 23:35:42', '', '', NULL, NULL, 'approved'),
(17, 19, 'CBR', 'Calauan', '2006-06-14', 18, 'Filipino', 'CBR Calauan', 'Retail Store', 'Laguna', 'Calauan', 'Silangan Pob.', 'L. Geirosa Avenue', 'Front of YM Fitness Gym Center', 'L.Gerosa avenue, Silangan (Pob.), Calauan, Laguna', '+639837483937', '../uploads/profile_images/profile_19_1744364105.jpg', '', '', '', '2025-04-11 06:37:38', '2025-07-27 23:36:01', '', '', NULL, NULL, 'pending'),
(19, 21, 'OTOP HUB', 'UPLB', '2001-06-13', 24, 'Filipino', 'UPLB Techno Hub & One‑Stop Shop', 'Retail Store', 'Laguna', 'Los Banos', 'Batong Malake', 'Mariano M. Mondoñedo Avenue', 'inc', 'Mariano M. Mondonedo Ave, Batong Malake, Los Baños, Laguna', '+639673720540', '../uploads/profile_images/profile_21_1748356914.png', '', '', '', '2025-04-22 05:28:30', '2025-07-27 23:43:09', '', '', NULL, NULL, 'approved'),
(30, 32, 'LIKHANG', 'LAGUNA', '2025-06-25', 30, 'Filipino', 'Likhang Laguna', 'Other', 'Laguna', 'Santa Cruz', 'Barangay I (Pob.)', '', 'Likhang Laguna Concept Store / LEDIPO', 'Barangay I (Pob.), Sta Cruz, Laguna', '+639161029839', NULL, '', '', '', '2025-06-25 08:59:01', '2025-07-28 02:46:51', '', '', NULL, NULL, 'approved'),
(32, 34, 'ISKARGU', 'CALAUAN', '2004-09-10', 20, 'Filipino', 'ISKARGU CALAUAN', 'Restaurant', 'Laguna', 'Calauan', 'Dayap', 'blk 65', 'Along the National Highway', 'Dayap, Calauan Laguna', '639175331021', NULL, '', '', '', '2025-07-24 13:52:41', '2025-07-27 23:45:20', 'School ID', 'uploads/documents/govid_68823aa93ecc7_fin-green (1).png', '', '', 'approved'),
(33, 35, 'OTAP HUB', 'EK', '2004-04-06', 21, 'Filipino', 'EK OTOP HUB', 'Retail Store', 'Laguna', 'City of Santa Rosa', 'Don Jose', '', 'Inside EK: Jungle Outpost & Cultural Village zones', 'Don Jose, City of Santa Rosa, Laguna', '+639351266459', NULL, '', '', '', '2025-07-27 06:31:20', '2025-07-28 02:46:01', 'School ID', 'uploads/documents/govid_6885c7b7d46a0_Screenshot 2025-03-30 012810.png', '', '', 'pending'),
(39, 41, 'A', 'A', '2025-07-27', 0, '', '', 'Online Shop', 'Agusan Del Sur', 'City of Bayugan', 'Cagbas', 'o', '', 'o, Barangay Cagbas, City of Bayugan, Agusan Del Sur', '+639153981708', NULL, '', '', '', '2025-07-28 07:47:29', '2025-07-28 07:47:29', 'UMID (Unified Multi-Purpose ID)', 'uploads/documents/govid_68872b112281e_product_1.png', '', '', 'pending'),
(40, 42, 'A', 'A', '2025-07-27', 0, '', '', 'Online Shop', 'Bukidnon', 'Maramag', 'Bagongsilang', 'p', '', 'p, Barangay Bagongsilang, Maramag, Bukidnon', '+639153981708', NULL, '', '', '', '2025-07-28 07:53:18', '2025-07-28 07:53:18', 'Philippine National ID (PhilSys)', 'uploads/documents/govid_68872c6e2aace_mono-green.png', '', '', 'pending'),
(41, 43, 'A', 'A', '2025-07-27', 0, '', '', 'Online Shop', 'Cagayan', 'Pamplona', 'Tupanna', '24', '', '24, Barangay Tupanna, Pamplona, Cagayan', '+639153981708', NULL, '', '', '', '2025-07-28 07:56:46', '2025-07-28 07:58:45', 'SSS ID', 'uploads/documents/govid_68872d3e7f86c_1533504c952a58aa4a06741ecb48f3ee.jpg', '', '', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('physical','online') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `address` text DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `opening_hours` varchar(255) DEFAULT NULL,
  `delivery_info` varchar(100) DEFAULT NULL,
  `communication_mode` varchar(50) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `type`, `created_at`, `updated_at`, `address`, `contact_name`, `contact_number`, `email`, `opening_hours`, `delivery_info`, `communication_mode`, `link`, `platform`, `notes`) VALUES
(26, 'Bake Log Calauan', 'physical', '2025-07-27 05:46:58', '2025-07-27 05:46:58', 'Masiit, Calauan, Laguna, Region 4A CALABARZON', 'Bake Log Calauan', '+63(049) 827 3110', '', '09:00 - 17:00', 'Business Driver', 'Call', NULL, NULL, ''),
(27, 'RSY San Pablo San Miguel Yamamura Corp.', 'physical', '2025-07-27 05:53:13', '2025-07-27 05:53:13', 'San Miguel, San Pablo City, Laguna, Region 4A CALABARZON', 'Janna Anilao', '+630960 276 8246', 'rsyglasstrading@yahoo.com', '07:00 - 18:00', 'Business Driver', 'Call', NULL, NULL, ''),
(28, 'EntrePouch', 'online', '2025-07-27 05:56:41', '2025-07-27 05:56:41', NULL, NULL, NULL, NULL, NULL, '3rd Party', NULL, 'https://shopee.ph/search?keyword=entrepouch', 'Shopee', '');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_alternatives`
--

CREATE TABLE `supplier_alternatives` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `contact_info` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `opening_hours` varchar(255) DEFAULT NULL,
  `platform` varchar(100) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `is_fixed_pineapple` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `farm_location` varchar(255) DEFAULT NULL,
  `delivery_info` varchar(255) DEFAULT NULL,
  `communication_mode` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `harvest_season` varchar(255) DEFAULT NULL,
  `planting_cycle` varchar(255) DEFAULT NULL,
  `variety` varchar(255) DEFAULT NULL,
  `shelf_life` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier','retailer') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`, `full_name`, `created_at`, `last_login`, `is_active`, `email_verified`, `verification_token`, `verification_expires`, `approval_status`) VALUES
(1, 'businesspos', 'businesspospassword', 'admin', 'admin@pinana.com', 'POS', '2025-03-20 14:01:08', NULL, 1, 0, NULL, NULL, 'pending'),
(2, 'businessadmin', '$2y$10$1krAKIufORu071I0LYvuAeoMl0f/FGNz/u7mNE8W3Vd6HwRDrqrfG', 'admin', 'pinanagourmet@gmail.com', 'Pinana Gourmet', '2025-03-20 15:43:46', '2025-07-28 07:12:01', 1, 1, NULL, NULL, 'pending'),
(12, 'pospinyana', '$2y$10$5wdwPfO4etp3X.BJPOngk.noi4RjpVjeuNxKfKJNQkyQ7Qhx9OI0a', 'cashier', 'eighthtargaryen@gmail.com', 'Eighth Targaryen', '2025-04-10 11:42:52', '2025-07-28 06:50:04', 1, 1, NULL, '2025-04-11 15:24:11', 'approved'),
(19, 'CBR calauan', '$2y$10$0pO9fKMMA7ulLtndhjaLG.2L2HZAPQPpSHVy6VukiyCHjKb5PRPC2', 'retailer', 'junkundesu1017@gmail.com', 'CBR Calauan Branch', '2025-04-11 06:37:38', '2025-07-27 18:31:26', 1, 1, NULL, '2025-04-12 08:37:48', 'approved'),
(21, 'OTOPHUBUPLB', '$2y$10$KTF3TY4slkQEM8lUPJNgfuD7NcUVnYkuEVDlacV22MJgBHIZpuQ5y', 'retailer', 'uplbtechnohub.otop@gmail.com', 'OTOP HUB UPLB', '2025-04-22 05:28:30', '2025-07-28 05:24:45', 1, 1, NULL, '2025-04-23 07:28:42', 'approved'),
(32, 'LIKHANGLAGUNA', '$2y$10$oO7cOlxdhs9KN72n5MvwIO7nQvp/g5GkFluVxogpMvUZ2ZhfFiIxe', 'retailer', 'benchlaxa5@gmail.com', 'LKHANG LAGUNA-LEDIPO LGU', '2025-06-25 08:59:01', '2025-07-28 08:13:56', 1, 1, '29adfde76abfca22c644ac927093d13314f80f8bfb939efd7a4de6c35f793021', '2025-07-29 06:27:25', 'approved'),
(34, 'ISKARGUCALAUAN', '$2y$10$aAM1f.n4bxJ683DRcmqqTuCJ52yL3xey7BPz6gMhemN5VgHKVH3US', 'retailer', 'margarita.iskargu@gmail.com', 'ISKARGU CALAUAN', '2025-07-24 13:52:41', NULL, 1, 1, NULL, '2025-07-25 15:52:50', 'approved'),
(35, 'OTOPHUBEK', '$2y$10$UIVSxobYubLBatF9MLpN6uCW1ptaJbxhdx3UbSa59oa2Q/fwpvFqe', 'retailer', 'eldarthewizard@enchantedkigdom.com', 'OTOP HUB EK', '2025-07-27 06:31:20', '2025-07-28 05:49:30', 1, 1, NULL, '2025-07-28 08:31:20', 'approved'),
(41, 'profj', '$2y$10$pQVYLxdY3/6u1b2hJWX0def1YVLU8CNMwDFkQHLrB9SuJlkPEKUhO', 'retailer', 'Profj@outlook.com', 'A A', '2025-07-28 07:47:29', NULL, 0, 0, 'c84297388698b98d693641ea41c51a9f60351cdbb1fdb16e198c46a705881dae', '2025-07-29 09:51:09', 'pending'),
(42, 'johncarlo', '$2y$10$MngLGhYM2cEilZB91xXA9ep1d3FUz7.syaKytjPIl4kWr.8FyoyaG', 'retailer', 'johncarlolandicho13@gmail.com', 'A A', '2025-07-28 07:53:18', NULL, 0, 0, '61ccb50d2f6875204827e4ed605d152eb27ff00e35f1a948ea12970dfe08cae0', '2025-07-29 09:53:26', 'pending'),
(43, 'a', '$2y$10$T7MpjiUATBrneUlKO6U5Je5HZOPzI2KqnQtko7Ph9Rhk5bLX8kbxe', 'retailer', 'pural.johnashleyc@gmail.com', 'A A', '2025-07-28 07:56:46', NULL, 1, 0, 'efe91604269b2639c36209ae89b33718a29e5962ef4992b4d569bdbf039a7ef6', '2025-07-29 09:56:55', 'approved');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_production_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_production_summary` (
`id` int(11)
,`production_id` varchar(50)
,`product_name` varchar(255)
,`category` varchar(100)
,`batch_size` int(11)
,`priority` enum('low','normal','high','urgent')
,`status` enum('pending','in-progress','quality-check','completed','cancelled','on-hold')
,`progress` decimal(5,2)
,`start_date` date
,`estimated_completion` datetime
,`actual_completion` datetime
,`production_type` enum('new-product','existing-batch','custom')
,`quantity_produced` int(11)
,`quantity_passed_qc` int(11)
,`quality_score` decimal(5,2)
,`total_cost` decimal(10,2)
,`cost_per_unit` decimal(10,4)
,`production_cost` decimal(10,2)
,`actual_duration_hours` bigint(21)
,`total_steps` bigint(21)
,`completed_steps` bigint(21)
);

-- --------------------------------------------------------

--
-- Structure for view `v_production_summary`
--
DROP TABLE IF EXISTS `v_production_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_production_summary`  AS SELECT `p`.`id` AS `id`, `p`.`production_id` AS `production_id`, `p`.`product_name` AS `product_name`, `p`.`category` AS `category`, `p`.`batch_size` AS `batch_size`, `p`.`priority` AS `priority`, `p`.`status` AS `status`, `p`.`progress` AS `progress`, `p`.`start_date` AS `start_date`, `p`.`estimated_completion` AS `estimated_completion`, `p`.`actual_completion` AS `actual_completion`, `p`.`production_type` AS `production_type`, `po`.`quantity_produced` AS `quantity_produced`, `po`.`quantity_passed_qc` AS `quantity_passed_qc`, `po`.`quality_score` AS `quality_score`, `po`.`total_cost` AS `total_cost`, `po`.`cost_per_unit` AS `cost_per_unit`, coalesce(`po`.`total_cost`,0) AS `production_cost`, CASE WHEN `p`.`actual_completion` is not null THEN timestampdiff(HOUR,`p`.`start_date`,`p`.`actual_completion`) ELSE NULL END AS `actual_duration_hours`, (select count(0) from `production_steps` `ps` where `ps`.`production_id` = `p`.`id`) AS `total_steps`, (select count(0) from `production_steps` `ps` where `ps`.`production_id` = `p`.`id` and `ps`.`status` = 'completed') AS `completed_steps` FROM (`productions` `p` left join `production_output` `po` on(`p`.`id` = `po`.`production_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `archived_users`
--
ALTER TABLE `archived_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_original_user_id` (`original_user_id`),
  ADD KEY `idx_archived_at` (`archived_at`);

--
-- Indexes for table `batch_history`
--
ALTER TABLE `batch_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `delivery_issues`
--
ALTER TABLE `delivery_issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email_type` (`email_type`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `equipment_usage`
--
ALTER TABLE `equipment_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`),
  ADD KEY `idx_equipment_name` (`equipment_name`),
  ADD KEY `idx_usage_start` (`usage_start`);

--
-- Indexes for table `fixed_pineapple_supplier`
--
ALTER TABLE `fixed_pineapple_supplier`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `change_type` (`change_type`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `last_check_times`
--
ALTER TABLE `last_check_times`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `check_type` (`check_type`),
  ADD KEY `check_type_2` (`check_type`);

--
-- Indexes for table `material_batches`
--
ALTER TABLE `material_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_batch_material` (`material_id`);

--
-- Indexes for table `material_containers`
--
ALTER TABLE `material_containers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `material_usage_log`
--
ALTER TABLE `material_usage_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `measurement_conversions`
--
ALTER TABLE `measurement_conversions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_id` (`notification_id`),
  ADD KEY `related_id` (`related_id`),
  ADD KEY `is_read` (`is_read`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `order_date` (`order_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `order_batch_usage`
--
ALTER TABLE `order_batch_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `payment_history`
--
ALTER TABLE `payment_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_history_order` (`order_id`),
  ADD KEY `idx_history_date` (`created_at`);

--
-- Indexes for table `pos_payment_methods`
--
ALTER TABLE `pos_payment_methods`
  ADD PRIMARY KEY (`payment_method_id`),
  ADD UNIQUE KEY `method_name` (`method_name`);

--
-- Indexes for table `pos_shifts`
--
ALTER TABLE `pos_shifts`
  ADD PRIMARY KEY (`shift_id`),
  ADD KEY `idx_cashier_id` (`cashier_id`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_end_time` (`end_time`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `pos_transactions`
--
ALTER TABLE `pos_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `pos_transaction_items`
--
ALTER TABLE `pos_transaction_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  ADD PRIMARY KEY (`refund_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `refund_method_id` (`refund_method_id`),
  ADD KEY `idx_refund_date` (`refund_date`);

--
-- Indexes for table `productions`
--
ALTER TABLE `productions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `production_id` (`production_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_productions_status_date` (`status`,`start_date`),
  ADD KEY `idx_productions_date_status` (`start_date`,`status`),
  ADD KEY `idx_productions_type_priority` (`production_type`,`priority`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_productions_category_status` (`category`,`status`);

--
-- Indexes for table `production_alerts`
--
ALTER TABLE `production_alerts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `alert_id` (`alert_id`),
  ADD UNIQUE KEY `uk_alert_id` (`alert_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_alert_type` (`alert_type`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_triggered_at` (`triggered_at`);

--
-- Indexes for table `production_analytics`
--
ALTER TABLE `production_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_metric_name` (`metric_name`),
  ADD KEY `idx_measurement_date` (`measurement_date`);

--
-- Indexes for table `production_costs`
--
ALTER TABLE `production_costs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_cost_type` (`cost_type`),
  ADD KEY `idx_cost_date` (`cost_date`),
  ADD KEY `idx_supplier_id` (`supplier_id`);

--
-- Indexes for table `production_materials`
--
ALTER TABLE `production_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_production_material` (`production_id`,`material_id`),
  ADD KEY `idx_production_material` (`production_id`,`material_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_production_materials_status` (`status`,`production_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_consumption_date` (`consumption_date`);

--
-- Indexes for table `production_material_usage`
--
ALTER TABLE `production_material_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_usage` (`production_id`,`material_id`),
  ADD KEY `idx_material_batch` (`material_batch_id`),
  ADD KEY `idx_usage_date` (`usage_date`),
  ADD KEY `idx_usage_type` (`usage_type`),
  ADD KEY `production_material_id` (`production_material_id`),
  ADD KEY `idx_material_usage_date_type` (`usage_date`,`usage_type`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`);

--
-- Indexes for table `production_output`
--
ALTER TABLE `production_output`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_output` (`production_id`),
  ADD KEY `idx_batch_code` (`output_batch_code`),
  ADD KEY `idx_manufacturing_date` (`manufacturing_date`),
  ADD KEY `idx_created_product` (`created_product_id`),
  ADD KEY `idx_created_batch` (`created_batch_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_output_batch_code` (`output_batch_code`),
  ADD KEY `idx_expiration_date` (`expiration_date`);

--
-- Indexes for table `production_quality_checks`
--
ALTER TABLE `production_quality_checks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`),
  ADD KEY `idx_check_type` (`check_type`),
  ADD KEY `idx_pass_fail` (`pass_fail`),
  ADD KEY `idx_checked_at` (`checked_at`);

--
-- Indexes for table `production_recipes`
--
ALTER TABLE `production_recipes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_recipe_id` (`recipe_id`),
  ADD KEY `idx_product_recipe` (`product_id`,`status`),
  ADD KEY `idx_recipe_name` (`recipe_name`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_default` (`is_default`);

--
-- Indexes for table `production_status_history`
--
ALTER TABLE `production_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_changed_at` (`changed_at`),
  ADD KEY `idx_new_status` (`new_status`);

--
-- Indexes for table `production_steps`
--
ALTER TABLE `production_steps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_production_step` (`production_id`,`step_number`),
  ADD KEY `idx_production_step` (`production_id`,`step_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `depends_on_step` (`depends_on_step`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_step_number` (`step_number`),
  ADD KEY `idx_started_at` (`started_at`);

--
-- Indexes for table `production_waste`
--
ALTER TABLE `production_waste`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_waste_type` (`waste_type`),
  ADD KEY `idx_waste_category` (`waste_category`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_products_name` (`product_name`),
  ADD KEY `idx_products_expiration` (`expiration_date`),
  ADD KEY `idx_production_reference` (`production_reference`);

--
-- Indexes for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `expiration_date` (`expiration_date`),
  ADD KEY `batch_code` (`batch_code`),
  ADD KEY `idx_batches_manufacturing` (`manufacturing_date`);

--
-- Indexes for table `product_price_history`
--
ALTER TABLE `product_price_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_product_price_history_product_id` (`product_id`),
  ADD KEY `idx_product_price_history_retailer_id` (`retailer_id`);

--
-- Indexes for table `product_pricing`
--
ALTER TABLE `product_pricing`
  ADD PRIMARY KEY (`pricing_id`),
  ADD UNIQUE KEY `unique_product_retailer` (`product_id`,`retailer_id`),
  ADD KEY `idx_product_pricing_product_id` (`product_id`),
  ADD KEY `idx_product_pricing_retailer_id` (`retailer_id`);

--
-- Indexes for table `quality_checkpoints`
--
ALTER TABLE `quality_checkpoints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `checkpoint_id` (`checkpoint_id`),
  ADD UNIQUE KEY `uk_checkpoint_id` (`checkpoint_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_inspection_date` (`inspection_date`);

--
-- Indexes for table `raw_materials`
--
ALTER TABLE `raw_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `material_id` (`material_id`),
  ADD KEY `idx_material_name` (`name`),
  ADD KEY `idx_material_category` (`category`),
  ADD KEY `idx_material_supplier` (`supplier_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_date_received` (`date_received`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_recipe_name` (`recipe_name`);

--
-- Indexes for table `recipe_materials`
--
ALTER TABLE `recipe_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipe_id` (`recipe_id`),
  ADD KEY `idx_material_id` (`material_id`);

--
-- Indexes for table `retailer_notifications`
--
ALTER TABLE `retailer_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_completed_orders` (`status`,`payment_status`),
  ADD KEY `fk_retailer_orders_user_id` (`user_id`),
  ADD KEY `idx_archived_user_id` (`archived_user_id`);

--
-- Indexes for table `retailer_order_deliveries`
--
ALTER TABLE `retailer_order_deliveries`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `idx_order_deliveries` (`order_id`),
  ADD KEY `idx_delivery_status` (`delivery_status`);

--
-- Indexes for table `retailer_order_delivery_issues`
--
ALTER TABLE `retailer_order_delivery_issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD KEY `idx_order_issues` (`order_id`),
  ADD KEY `idx_issue_status` (`issue_status`);

--
-- Indexes for table `retailer_order_issues`
--
ALTER TABLE `retailer_order_issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_order_id` (`order_id`);

--
-- Indexes for table `retailer_order_item_payments`
--
ALTER TABLE `retailer_order_item_payments`
  ADD PRIMARY KEY (`item_payment_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `fk_payment_id` (`payment_id`),
  ADD KEY `idx_retailer_order_item_payments_product` (`product_id`);

--
-- Indexes for table `retailer_order_item_verification`
--
ALTER TABLE `retailer_order_item_verification`
  ADD PRIMARY KEY (`verification_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `retailer_order_payments`
--
ALTER TABLE `retailer_order_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_order_returns`
--
ALTER TABLE `retailer_order_returns`
  ADD PRIMARY KEY (`return_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_order_return_items`
--
ALTER TABLE `retailer_order_return_items`
  ADD PRIMARY KEY (`return_item_id`),
  ADD KEY `return_id` (`return_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_payments`
--
ALTER TABLE `retailer_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_payment_order` (`order_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_method` (`payment_method`);

--
-- Indexes for table `retailer_payment_items`
--
ALTER TABLE `retailer_payment_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `retailer_pickup_orders`
--
ALTER TABLE `retailer_pickup_orders`
  ADD PRIMARY KEY (`pickup_order_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_pickup_status_history`
--
ALTER TABLE `retailer_pickup_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `pickup_order_id` (`pickup_order_id`);

--
-- Indexes for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supplier_type` (`type`);

--
-- Indexes for table `supplier_alternatives`
--
ALTER TABLE `supplier_alternatives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `archived_users`
--
ALTER TABLE `archived_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `batch_history`
--
ALTER TABLE `batch_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `delivery_issues`
--
ALTER TABLE `delivery_issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `equipment_usage`
--
ALTER TABLE `equipment_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fixed_pineapple_supplier`
--
ALTER TABLE `fixed_pineapple_supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_log`
--
ALTER TABLE `inventory_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `last_check_times`
--
ALTER TABLE `last_check_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `material_batches`
--
ALTER TABLE `material_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `material_containers`
--
ALTER TABLE `material_containers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `material_usage_log`
--
ALTER TABLE `material_usage_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `measurement_conversions`
--
ALTER TABLE `measurement_conversions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `order_batch_usage`
--
ALTER TABLE `order_batch_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_history`
--
ALTER TABLE `payment_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pos_payment_methods`
--
ALTER TABLE `pos_payment_methods`
  MODIFY `payment_method_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pos_shifts`
--
ALTER TABLE `pos_shifts`
  MODIFY `shift_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pos_transaction_items`
--
ALTER TABLE `pos_transaction_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  MODIFY `refund_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productions`
--
ALTER TABLE `productions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=421;

--
-- AUTO_INCREMENT for table `production_alerts`
--
ALTER TABLE `production_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_analytics`
--
ALTER TABLE `production_analytics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_costs`
--
ALTER TABLE `production_costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_materials`
--
ALTER TABLE `production_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=425;

--
-- AUTO_INCREMENT for table `production_material_usage`
--
ALTER TABLE `production_material_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_output`
--
ALTER TABLE `production_output`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=295;

--
-- AUTO_INCREMENT for table `production_quality_checks`
--
ALTER TABLE `production_quality_checks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_recipes`
--
ALTER TABLE `production_recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `production_status_history`
--
ALTER TABLE `production_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_steps`
--
ALTER TABLE `production_steps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2497;

--
-- AUTO_INCREMENT for table `production_waste`
--
ALTER TABLE `production_waste`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=352;

--
-- AUTO_INCREMENT for table `product_batches`
--
ALTER TABLE `product_batches`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- AUTO_INCREMENT for table `product_price_history`
--
ALTER TABLE `product_price_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_pricing`
--
ALTER TABLE `product_pricing`
  MODIFY `pricing_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quality_checkpoints`
--
ALTER TABLE `quality_checkpoints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `raw_materials`
--
ALTER TABLE `raw_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=249;

--
-- AUTO_INCREMENT for table `recipe_materials`
--
ALTER TABLE `recipe_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=294;

--
-- AUTO_INCREMENT for table `retailer_notifications`
--
ALTER TABLE `retailer_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=404;

--
-- AUTO_INCREMENT for table `retailer_order_deliveries`
--
ALTER TABLE `retailer_order_deliveries`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_order_delivery_issues`
--
ALTER TABLE `retailer_order_delivery_issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_order_issues`
--
ALTER TABLE `retailer_order_issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=419;

--
-- AUTO_INCREMENT for table `retailer_order_item_payments`
--
ALTER TABLE `retailer_order_item_payments`
  MODIFY `item_payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `retailer_order_item_verification`
--
ALTER TABLE `retailer_order_item_verification`
  MODIFY `verification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `retailer_order_payments`
--
ALTER TABLE `retailer_order_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `retailer_order_returns`
--
ALTER TABLE `retailer_order_returns`
  MODIFY `return_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `retailer_order_return_items`
--
ALTER TABLE `retailer_order_return_items`
  MODIFY `return_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1168;

--
-- AUTO_INCREMENT for table `retailer_payments`
--
ALTER TABLE `retailer_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_payment_items`
--
ALTER TABLE `retailer_payment_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_pickup_orders`
--
ALTER TABLE `retailer_pickup_orders`
  MODIFY `pickup_order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `retailer_pickup_status_history`
--
ALTER TABLE `retailer_pickup_status_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `supplier_alternatives`
--
ALTER TABLE `supplier_alternatives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `delivery_issues`
--
ALTER TABLE `delivery_issues`
  ADD CONSTRAINT `delivery_issues_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `equipment_usage`
--
ALTER TABLE `equipment_usage`
  ADD CONSTRAINT `equipment_usage_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `equipment_usage_ibfk_2` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD CONSTRAINT `inventory_log_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `inventory_log_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE SET NULL;

--
-- Constraints for table `material_batches`
--
ALTER TABLE `material_batches`
  ADD CONSTRAINT `material_batches_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `material_containers`
--
ALTER TABLE `material_containers`
  ADD CONSTRAINT `material_containers_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`),
  ADD CONSTRAINT `material_containers_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `material_batches` (`id`);

--
-- Constraints for table `material_usage_log`
--
ALTER TABLE `material_usage_log`
  ADD CONSTRAINT `material_usage_log_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`);

--
-- Constraints for table `payment_history`
--
ALTER TABLE `payment_history`
  ADD CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`),
  ADD CONSTRAINT `payment_history_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `retailer_payments` (`payment_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_history_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `retailer_profiles` (`user_id`);

--
-- Constraints for table `pos_transaction_items`
--
ALTER TABLE `pos_transaction_items`
  ADD CONSTRAINT `pos_transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`) ON DELETE CASCADE;

--
-- Constraints for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  ADD CONSTRAINT `pos_transaction_payments_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pos_transaction_payments_ibfk_2` FOREIGN KEY (`payment_method_id`) REFERENCES `pos_payment_methods` (`payment_method_id`);

--
-- Constraints for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  ADD CONSTRAINT `pos_transaction_refunds_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`),
  ADD CONSTRAINT `pos_transaction_refunds_ibfk_2` FOREIGN KEY (`refund_method_id`) REFERENCES `pos_payment_methods` (`payment_method_id`);

--
-- Constraints for table `production_alerts`
--
ALTER TABLE `production_alerts`
  ADD CONSTRAINT `fk_production_alerts_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_alerts_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_alerts_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_analytics`
--
ALTER TABLE `production_analytics`
  ADD CONSTRAINT `production_analytics_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_costs`
--
ALTER TABLE `production_costs`
  ADD CONSTRAINT `fk_production_costs_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_costs_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_costs_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_materials`
--
ALTER TABLE `production_materials`
  ADD CONSTRAINT `fk_production_materials_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_materials_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_materials_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_material_usage`
--
ALTER TABLE `production_material_usage`
  ADD CONSTRAINT `fk_material_usage_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_material_usage_step` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_material_usage_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_material_usage_ibfk_2` FOREIGN KEY (`production_material_id`) REFERENCES `production_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_material_usage_ibfk_3` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_material_usage_ibfk_4` FOREIGN KEY (`material_batch_id`) REFERENCES `material_batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_material_usage_ibfk_5` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_output`
--
ALTER TABLE `production_output`
  ADD CONSTRAINT `fk_production_output_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_output_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_output_ibfk_2` FOREIGN KEY (`created_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_output_ibfk_3` FOREIGN KEY (`created_batch_id`) REFERENCES `product_batches` (`batch_id`) ON DELETE SET NULL;

--
-- Constraints for table `production_quality_checks`
--
ALTER TABLE `production_quality_checks`
  ADD CONSTRAINT `fk_quality_checks_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quality_checks_step` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_recipes`
--
ALTER TABLE `production_recipes`
  ADD CONSTRAINT `production_recipes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_status_history`
--
ALTER TABLE `production_status_history`
  ADD CONSTRAINT `fk_status_history_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_steps`
--
ALTER TABLE `production_steps`
  ADD CONSTRAINT `fk_production_steps_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_steps_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_steps_ibfk_2` FOREIGN KEY (`depends_on_step`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_waste`
--
ALTER TABLE `production_waste`
  ADD CONSTRAINT `production_waste_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_waste_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quality_checkpoints`
--
ALTER TABLE `quality_checkpoints`
  ADD CONSTRAINT `quality_checkpoints_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quality_checkpoints_ibfk_2` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  ADD CONSTRAINT `fk_retailer_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `retailer_profiles` (`user_id`);

--
-- Constraints for table `retailer_order_deliveries`
--
ALTER TABLE `retailer_order_deliveries`
  ADD CONSTRAINT `retailer_order_deliveries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_delivery_issues`
--
ALTER TABLE `retailer_order_delivery_issues`
  ADD CONSTRAINT `retailer_order_delivery_issues_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_issues`
--
ALTER TABLE `retailer_order_issues`
  ADD CONSTRAINT `retailer_order_issues_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  ADD CONSTRAINT `fk_order_id` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_item_payments`
--
ALTER TABLE `retailer_order_item_payments`
  ADD CONSTRAINT `fk_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `retailer_order_payments` (`payment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `retailer_order_item_payments_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `retailer_order_payments` (`payment_id`),
  ADD CONSTRAINT `retailer_order_item_payments_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `retailer_order_items` (`item_id`);

--
-- Constraints for table `retailer_order_item_verification`
--
ALTER TABLE `retailer_order_item_verification`
  ADD CONSTRAINT `retailer_order_item_verification_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`),
  ADD CONSTRAINT `retailer_order_item_verification_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `retailer_order_items` (`item_id`);

--
-- Constraints for table `retailer_order_payments`
--
ALTER TABLE `retailer_order_payments`
  ADD CONSTRAINT `retailer_order_payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`);

--
-- Constraints for table `retailer_order_returns`
--
ALTER TABLE `retailer_order_returns`
  ADD CONSTRAINT `retailer_order_returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`);

--
-- Constraints for table `retailer_order_return_items`
--
ALTER TABLE `retailer_order_return_items`
  ADD CONSTRAINT `retailer_order_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `retailer_order_returns` (`return_id`),
  ADD CONSTRAINT `retailer_order_return_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `retailer_order_items` (`item_id`);

--
-- Constraints for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  ADD CONSTRAINT `retailer_order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_payments`
--
ALTER TABLE `retailer_payments`
  ADD CONSTRAINT `retailer_payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`),
  ADD CONSTRAINT `retailer_payments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `retailer_profiles` (`user_id`);

--
-- Constraints for table `retailer_payment_items`
--
ALTER TABLE `retailer_payment_items`
  ADD CONSTRAINT `retailer_payment_items_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `retailer_payments` (`payment_id`),
  ADD CONSTRAINT `retailer_payment_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `retailer_pickup_orders`
--
ALTER TABLE `retailer_pickup_orders`
  ADD CONSTRAINT `retailer_pickup_orders_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_pickup_status_history`
--
ALTER TABLE `retailer_pickup_status_history`
  ADD CONSTRAINT `retailer_pickup_status_history_ibfk_1` FOREIGN KEY (`pickup_order_id`) REFERENCES `retailer_pickup_orders` (`pickup_order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  ADD CONSTRAINT `retailer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_alternatives`
--
ALTER TABLE `supplier_alternatives`
  ADD CONSTRAINT `supplier_alternatives_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
