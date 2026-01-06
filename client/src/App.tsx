import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public Pages
import Home from "./pages/Home";
import JobApplication from "./pages/JobApplication";
import TrackApplication from "./pages/TrackApplication";
import ResumeBuilder from "./pages/ResumeBuilder";
import Facilities from "./pages/Facilities";
import FacilityPage from "./pages/FacilityPage";
import OtherServices from "./pages/OtherServices";
import FacilitiesMap from "./pages/FacilitiesMap";

// Admin Pages
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFacilities from "./pages/admin/Facilities";
import AdminFacilityDetails from "./pages/admin/FacilityDetails";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/apply" component={JobApplication} />
      <Route path="/track" component={TrackApplication} />
      <Route path="/resume" component={ResumeBuilder} />
      <Route path="/facilities" component={Facilities} />
      <Route path="/facility/:id" component={FacilityPage} />
      <Route path="/services" component={OtherServices} />
      <Route path="/facilities/map" component={FacilitiesMap} />

      {/* Admin Routes */}
      <Route path="/admin">
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/admin/facilities">
        <DashboardLayout>
          <AdminFacilities />
        </DashboardLayout>
      </Route>
      <Route path="/admin/facilities/:id">
        {(params) => (
          <DashboardLayout>
            <AdminFacilityDetails />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/jobs">
        <DashboardLayout>
          <AdminJobs />
        </DashboardLayout>
      </Route>
      <Route path="/admin/applications">
        <DashboardLayout>
          <AdminApplications />
        </DashboardLayout>
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
