import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

// Listens for follow-up reminder notifications.
// NOTE: actual opening of entity-specific followup modals
// should be handled in the pages/components that know how to
// open those modals (e.g. using their own context or props).
export default function FollowupModalListener() {
  const { followupReminder, setFollowupReminder } = useNotifications() || {};

  useEffect(() => {
    if (!followupReminder || !followupReminder.notification) return;
    // At this point you can use followupReminder.notification.entity
    // and .targetId inside your domain-specific components to
    // open the correct modal when needed.

    // clear after handling so we don't reopen on re-render
    if (typeof setFollowupReminder === 'function') {
      setFollowupReminder(null);
    }
  }, [followupReminder, setFollowupReminder]);

  return null;
}
