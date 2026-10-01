import React from 'react';
import { TimelineItem } from '../../types/problem';
import { StatusPill } from '../ui/StatusPill';
import { formatDate } from '../../utils/formatters';
import { History, Clock } from 'lucide-react';

export const TimelineWidget: React.FC<{ timeline?: TimelineItem[] }> = ({ timeline = [] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
        <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1]">
          Problem Lifecycle Timeline
        </h3>
      </div>

      {timeline.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
          Initial report logged. Awaiting municipal triage review.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e5e1d8] dark:before:bg-[#24312b]">
          {timeline.map((event, index) => (
            <div key={event.id || index} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-[#141d19] border-2 border-[#0f6b4f] dark:border-[#5cc9a0] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#0f6b4f] dark:bg-[#5cc9a0]" />
              </div>

              {/* Event Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={event.toStatus} size="sm" />
                  <span className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
                    by <strong className="text-[#14201c] dark:text-[#ece9e1]">{event.actor.name}</strong> ({event.actor.role})
                  </span>
                </div>

                {event.note && (
                  <p className="text-xs text-[#44403c] dark:text-[#9aa8a1] bg-[#faf8f4] dark:bg-[#0e1512] p-2.5 rounded-lg border border-[#e5e1d8] dark:border-[#24312b] mt-1.5 leading-relaxed">
                    {event.note}
                  </p>
                )}

                <div className="text-[11px] text-[#a8a29e] flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(event.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
