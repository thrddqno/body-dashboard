import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";

export function NotFoundPage() {
  return (
    <main>
      <EmptyState
        title="Page not found"
        description="The requested page does not exist in the current frontend application."
        action={
          <Link
            to="/"
            className="button-primary"
          >
            Return to dashboard
          </Link>
        }
      />
    </main>
  );
}
