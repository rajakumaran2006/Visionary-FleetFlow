# 🚛 FleetFlow - Advanced Fleet Management System

FleetFlow is a premium, full-stack fleet management solution designed to streamline logistics, maintenance, and financial tracking for modern transport businesses.

## 🌟 Key Features

- **Role-Based Access Control**: Tailored experiences for Fleet Managers, Dispatchers, Analysts, and Safety Officers.
- **Real-time Trip Dispatching**: Efficiently assign drivers and vehicles to cargo missions.
- **Comprehensive Maintenance Logs**: Track every repair and service event to ensure fleet longevity.
- **Advanced Financial Analytics**: Monitor fuel efficiency, operational costs, and ROI via interactive charts.
- **Driver Management**: Maintain compliance with license tracking and safety locks.
- **Premium UI/UX**: A dark-themed, glassmorphic design built for professional efficiency.

## 👥 Roles & Capabilities

The system is divided into four distinct roles. For a detailed breakdown of what each role can do and an explanation of every page, please refer to our **[Role & Page Guide](./roles_guide.md)**.

| Role | Primary Focus | Key Responsibilities |
| :--- | :--- | :--- |
| **Fleet Manager** | Asset Health | Vehicle registry, Maintenance scheduling, Fleet diagnostics |
| **Trip Dispatcher** | Operations | Trip planning, Cargo assignment, Real-time tracking |
| **Financial Analyst** | Profitability | Expense logging, ROI reports, Monthly financial summaries |
| **Safety Officer** | Compliance | Driver profiles, License tracking, Safety enforcement |

## 🚀 Getting Started

### 🏗️ Prerequisites
- Node.js (Latest LTS recommended)
- Supabase Account (PostgreSQL + Auth)

### 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fleetflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Setup Test Users**:
   To test the different roles, you can run the setup script (if available) or create users in Supabase with the following roles in your `users` table:
   - `Fleet Manager`
   - `Dispatcher`
   - `Financial Analyst`
   - `Safety Officer`

## 📘 Detailed Documentation

- **[Roles & Page Explanation](./roles_guide.md)**: A simple and deep dive into how to use FleetFlow.

---

Built with ❤️ using Next.js, Supabase, and Recharts.
