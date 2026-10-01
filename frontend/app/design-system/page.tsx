'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusPill } from '../../components/ui/StatusPill';
import { Dropdown } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { Loading, Skeleton } from '../../components/ui/Loading';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Pagination } from '../../components/ui/Pagination';
import { ProblemStatus } from '../../types/problem';
import { Search, Mail, MapPin, Plus } from 'lucide-react';

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownValue, setDropdownValue] = useState('ROAD');

  const statuses: ProblemStatus[] = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'COMMUNITY_VERIFIED',
    'CLOSED',
    'REJECTED',
    'DUPLICATE',
    'REOPENED',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* Header */}
        <div className="border-b border-[#e6e2dc] pb-6">
          <h1 className="text-3xl font-bold font-heading text-[#1c1917]">
            Design System Components
          </h1>
          <p className="text-sm text-[#78716c] mt-2">
            Phase 2 reusable UI component gallery built using ProblemPulse design tokens: warm off-white background, Fraunces headings, Inter body typography, green accent (#0f6b4f), thin 1px borders, and priority color badges.
          </p>
        </div>

        {/* 1. Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            1. Buttons
          </h2>
          <Card className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary Green</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              With Icon
            </Button>
            <Button variant="outline" size="sm">
              Small
            </Button>
            <Button variant="outline" size="lg">
              Large
            </Button>
          </Card>
        </section>

        {/* 2. Priority Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            2. Priority Badges
          </h2>
          <Card className="flex flex-wrap items-center gap-6">
            <PriorityBadge priority="CRITICAL" />
            <PriorityBadge priority="MAJOR" />
            <PriorityBadge priority="LOW" />
          </Card>
        </section>

        {/* 3. Status Pills */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            3. Status Pills
          </h2>
          <Card className="flex flex-wrap items-center gap-3">
            {statuses.map((status) => (
              <StatusPill key={status} status={status} />
            ))}
          </Card>
        </section>

        {/* 4. Inputs & Dropdowns */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            4. Inputs & Dropdowns
          </h2>
          <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Problem Title"
              placeholder="e.g. Large pothole on Main Street"
              helperText="Be specific about the problem summary"
            />
            <Input
              label="Email Address"
              placeholder="user@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Location"
              placeholder="Search address..."
              leftIcon={<MapPin className="w-4 h-4" />}
              error="Location coordinates required"
            />
            <Dropdown
              label="Category"
              value={dropdownValue}
              onChange={(e) => setDropdownValue(e.target.value)}
              options={[
                { value: 'ROAD', label: 'Road & Potholes' },
                { value: 'WATER', label: 'Water Supply' },
                { value: 'GARBAGE', label: 'Garbage & Sanitation' },
                { value: 'ELECTRICITY', label: 'Electricity & Streetlights' },
              ]}
            />
          </Card>
        </section>

        {/* 5. Cards & Containers */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            5. Cards & Containers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable>
              <div className="flex items-center justify-between mb-3">
                <PriorityBadge priority="CRITICAL" />
                <StatusPill status="IN_PROGRESS" />
              </div>
              <h3 className="font-semibold text-[#1c1917] mb-1 font-heading text-lg">
                Water Main Break on 5th Ave
              </h3>
              <p className="text-xs text-[#78716c]">
                Hoverable card container with thin 1px border.
              </p>
            </Card>

            <Card variant="outline">
              <h3 className="font-semibold text-[#1c1917] mb-1 font-heading">
                Outline Container
              </h3>
              <p className="text-xs text-[#78716c]">
                Transparent outline variant for list sections.
              </p>
            </Card>

            <Card variant="flat">
              <h3 className="font-semibold text-[#1c1917] mb-1 font-heading">
                Flat Warm Container
              </h3>
              <p className="text-xs text-[#78716c]">
                Background fill variant for secondary blocks.
              </p>
            </Card>
          </div>
        </section>

        {/* 6. Modals & Dialogs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            6. Modal Dialogs
          </h2>
          <Card className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#1c1917]">Accessible Modal</h3>
              <p className="text-xs text-[#78716c]">
                Supports backdrop click, Escape key, scroll lock, header, and action buttons.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Demo Modal
            </Button>
          </Card>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirm Problem Verification"
            subtitle="Admin review action"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm Verification
                </Button>
              </>
            }
          >
            <p>
              Are you sure you want to mark this reported problem as verified? This action will update its lifecycle status to <strong>VERIFIED</strong> and enable department assignment.
            </p>
          </Modal>
        </section>

        {/* 7. Loaders & Alerts */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            7. Loading & Error States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <h3 className="font-semibold text-[#1c1917] text-sm">Spinners & Skeletons</h3>
              <Loading size="md" text="Loading problem reports..." />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="font-semibold text-[#1c1917] text-sm">Alert Banner</h3>
              <ErrorMessage
                title="Failed to fetch problems"
                message="Network error encountered while fetching feed items."
                onRetry={() => alert('Retrying...')}
              />
            </Card>
          </div>
        </section>

        {/* 8. Pagination */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-heading text-[#1c1917]">
            8. Pagination
          </h2>
          <Card>
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
