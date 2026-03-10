import { useEffect, useCallback } from "react";

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface PageView {
  path: string;
  title: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private sessionStart: Date;
  private enabled: boolean = true;

  constructor() {
    this.sessionStart = new Date();
    this.loadFromStorage();
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.enabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    };

    this.events.push(enrichedEvent);
    this.saveToStorage();

    console.log("[Analytics] Event:", enrichedEvent);
  }

  trackPageView(pageView: PageView) {
    if (!this.enabled) return;

    const enrichedPageView = {
      ...pageView,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    };

    this.pageViews.push(enrichedPageView);
    this.saveToStorage();

    console.log("[Analytics] Page View:", enrichedPageView);
  }

  getEvents() {
    return this.events;
  }

  getPageViews() {
    return this.pageViews;
  }

  getSessionDuration() {
    return Date.now() - this.sessionStart.getTime();
  }

  getStats() {
    return {
      totalEvents: this.events.length,
      totalPageViews: this.pageViews.length,
      sessionDuration: this.getSessionDuration(),
      topCategories: this.getTopCategories(),
      topActions: this.getTopActions(),
    };
  }

  private getTopCategories() {
    const counts: Record<string, number> = {};
    this.events.forEach((event) => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  private getTopActions() {
    const counts: Record<string, number> = {};
    this.events.forEach((event) => {
      counts[event.action] = (counts[event.action] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));
  }

  private getSessionId() {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }

  private saveToStorage() {
    try {
      localStorage.setItem(
        "analytics_events",
        JSON.stringify(this.events.slice(-100)),
      );
      localStorage.setItem(
        "analytics_pageviews",
        JSON.stringify(this.pageViews.slice(-50)),
      );
    } catch (error) {
      console.error("Failed to save analytics:", error);
    }
  }

  private loadFromStorage() {
    try {
      const events = localStorage.getItem("analytics_events");
      const pageViews = localStorage.getItem("analytics_pageviews");

      if (events) this.events = JSON.parse(events);
      if (pageViews) this.pageViews = JSON.parse(pageViews);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  }

  clearData() {
    this.events = [];
    this.pageViews = [];
    localStorage.removeItem("analytics_events");
    localStorage.removeItem("analytics_pageviews");
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

const analyticsService = new AnalyticsService();

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    analyticsService.trackEvent(event);
  }, []);

  const trackPageView = useCallback((pageView: PageView) => {
    analyticsService.trackPageView(pageView);
  }, []);

  const trackClick = useCallback(
    (element: string, location?: string) => {
      trackEvent({
        category: "User Interaction",
        action: "Click",
        label: `${element}${location ? ` - ${location}` : ""}`,
      });
    },
    [trackEvent],
  );

  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      trackEvent({
        category: "Search",
        action: "Query",
        label: query,
        value: resultsCount,
      });
    },
    [trackEvent],
  );

  const trackFeatureUse = useCallback(
    (feature: string) => {
      trackEvent({
        category: "Feature Usage",
        action: "Use",
        label: feature,
      });
    },
    [trackEvent],
  );

  const trackError = useCallback(
    (error: string, context?: string) => {
      trackEvent({
        category: "Error",
        action: "Occurred",
        label: `${error}${context ? ` - ${context}` : ""}`,
      });
    },
    [trackEvent],
  );

  const getStats = useCallback(() => {
    return analyticsService.getStats();
  }, []);

  const clearData = useCallback(() => {
    analyticsService.clearData();
  }, []);

  useEffect(() => {
    // Track session start
    trackEvent({
      category: "Session",
      action: "Start",
    });

    // Track session end on unmount
    return () => {
      trackEvent({
        category: "Session",
        action: "End",
        value: analyticsService.getSessionDuration(),
      });
    };
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackSearch,
    trackFeatureUse,
    trackError,
    getStats,
    clearData,
  };
}
