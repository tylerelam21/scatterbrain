"use client";

import { deleteProject } from "@/server/actions/work";

export function DeleteProjectForm({ id, isLab }: { id: string; isLab: boolean }) {
  return (
    <form
      action={deleteProject.bind(null, id, isLab)}
      onSubmit={(event) => {
        if (!confirm("Delete this project? This can't be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-muted hover:text-accent">
        Delete
      </button>
    </form>
  );
}
