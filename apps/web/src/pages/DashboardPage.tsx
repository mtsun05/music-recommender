import { useAuth, useUser } from "@clerk/clerk-react";
import type { RecommendationRequestStatusResponse } from "@music-recommender/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout.js";
import { RecommendationForm } from "../components/RecommendationForm.js";
import { RecommendationStatus } from "../components/RecommendationStatus.js";
import { createApiClient } from "../lib/apiClient.js";

type RecentRequest = {
  id: string;
  status: string;
  input: string;
  requestedLimit: number;
  createdAt: string;
};

export function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useMemo(() => createApiClient(getToken), [getToken]);
  const [appUserName, setAppUserName] = useState<string | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<RecommendationRequestStatusResponse | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRecentRequests = useCallback(async () => {
    const response = await api.listRecommendationRequests();
    setRecentRequests(response.requests);
  }, [api]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [me] = await Promise.all([api.getMe(), refreshRecentRequests()]);
        if (isMounted) {
          setAppUserName(me.displayName ?? me.email ?? "Signed-in listener");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [api, refreshRecentRequests]);

  useEffect(() => {
    if (
      !activeRequest ||
      activeRequest.status === "completed" ||
      activeRequest.status === "failed"
    ) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await api.getRecommendationRequest(activeRequest.id);
        setActiveRequest(response);
        await refreshRecentRequests();
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : "Failed to poll request");
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [activeRequest, api, refreshRecentRequests]);

  return (
    <Layout>
      <section className="dashboard-grid">
        <div className="dashboard-main">
          <p className="eyebrow">Signed in as</p>
          <h1>{appUserName ?? user?.primaryEmailAddress?.emailAddress ?? "Listener"}</h1>
          <RecommendationForm
            isSubmitting={isSubmitting}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              setError(null);
              try {
                const created = await api.createRecommendationRequest({
                  input: values.input,
                  requestType: "item_based",
                  requestedLimit: values.requestedLimit,
                  filters: {}
                });
                const status = await api.getRecommendationRequest(created.requestId);
                setActiveRequest(status);
                await refreshRecentRequests();
              } catch (submitError) {
                setError(
                  submitError instanceof Error ? submitError.message : "Failed to submit request"
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
          {error ? <p className="error-text">{error}</p> : null}
          <RecommendationStatus request={activeRequest} />
        </div>
        <aside className="recent-panel">
          <h2>Recent requests</h2>
          {recentRequests.length === 0 ? (
            <p className="muted">No requests queued yet.</p>
          ) : (
            <ul>
              {recentRequests.map((request) => (
                <li key={request.id}>
                  <button
                    type="button"
                    onClick={async () => {
                      const status = await api.getRecommendationRequest(request.id);
                      setActiveRequest(status);
                    }}
                  >
                    <span>{request.input}</span>
                    <small>{request.status}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </Layout>
  );
}
