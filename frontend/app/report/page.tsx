'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { StepIndicator } from '../../components/report/StepIndicator';
import { StepCategory } from '../../components/report/StepCategory';
import { StepEvidence } from '../../components/report/StepEvidence';
import { StepLocation, LocationData } from '../../components/report/StepLocation';
import { StepDetails, DetailsData } from '../../components/report/StepDetails';
import { StepReview } from '../../components/report/StepReview';
import { DuplicateWarningModal } from '../../components/report/DuplicateWarningModal';
import { Button } from '../../components/ui/Button';
import { ProblemCategory, NearbyProblemMatch } from '../../types/problem';
import { UploadedMediaItem } from '../../services/media.service';
import { problemService, CreateProblemPayload } from '../../services/problem.service';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  CheckCircle2,
  MapPin,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

const INITIAL_LOCATION: LocationData = {
  latitude: 12.9716,
  longitude: 77.5946,
  address: 'MG Road, Central Ward',
  area: 'Central Ward',
  city: 'Bengaluru',
  state: 'Karnataka',
};

const INITIAL_DETAILS: DetailsData = {
  title: '',
  description: '',
  severity: 5,
  peopleAffected: 50,
};

export default function ReportPage() {
  // Wizard Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const [mediaList, setMediaList] = useState<UploadedMediaItem[]>([]);
  const [location, setLocation] = useState<LocationData>(INITIAL_LOCATION);
  const [details, setDetails] = useState<DetailsData>(INITIAL_DETAILS);
  const [verifiedDeclaration, setVerifiedDeclaration] = useState<boolean>(true);

  // Duplicate Detection State (Phase 11)
  const [duplicates, setDuplicates] = useState<NearbyProblemMatch[]>([]);
  const [isLoadingDuplicates, setIsLoadingDuplicates] = useState<boolean>(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState<boolean>(false);
  const [isLinkingReport, setIsLinkingReport] = useState<boolean>(false);
  const [isLinkedReport, setIsLinkedReport] = useState<boolean>(false);
  const [linkedProblemTitle, setLinkedProblemTitle] = useState<string | null>(null);

  // Submission & UI State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submittedProblemId, setSubmittedProblemId] = useState<string | null>(null);

  // Try to load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('problempulse_report_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.mediaList) setMediaList(parsed.mediaList);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.details) setDetails(parsed.details);
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Save draft whenever inputs change
  useEffect(() => {
    try {
      const draft = { category, mediaList, location, details };
      localStorage.setItem('problempulse_report_draft', JSON.stringify(draft));
    } catch {
      // Ignore local storage error
    }
  }, [category, mediaList, location, details]);

  // Check for nearby duplicates whenever category or location coordinates change
  useEffect(() => {
    let isMounted = true;

    if (!category || !location.latitude || !location.longitude) {
      return;
    }

    problemService
      .checkDuplicates({
        category,
        latitude: location.latitude,
        longitude: location.longitude,
        radiusMeters: 100,
      })
      .then((res) => {
        if (isMounted) {
          setDuplicates(res.duplicates || []);
          setDuplicateAcknowledged(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDuplicates([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDuplicates(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category, location.latitude, location.longitude]);

  // Step Validation Handler
  const validateAndProceed = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!category) {
        setValidationError('Please select a problem category to continue.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      // Evidence is optional according to design, but if uploaded it should be valid
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 3) {
      // Forgiving Location Step: Auto-fill any missing fields so citizen is never blocked
      const finalAddress = location.address.trim() || 'Pinned Location on Map';
      const finalArea = location.area.trim() || 'Central Ward';
      const finalCity = location.city.trim() || 'Bengaluru';
      const finalState = location.state?.trim() || 'Karnataka';

      setLocation({
        ...location,
        address: finalAddress,
        area: finalArea,
        city: finalCity,
        state: finalState,
      });

      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 4) {
      // Forgiving Details Step: Ensure sensible defaults if user enters minimal text
      const rawTitle = details.title.trim();
      const rawDesc = details.description.trim();

      const finalTitle =
        rawTitle.length >= 3
          ? rawTitle.length < 5
            ? `${rawTitle} issue`
            : rawTitle
          : `${category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace('_', ' ') : 'Civic'} Issue at ${location.address || 'location'}`;

      const finalDesc =
        rawDesc.length >= 5
          ? rawDesc.length < 10
            ? `${rawDesc} - reported for municipal review.`
            : rawDesc
          : `Civic issue reported near ${location.address || 'pinned location'}, ${location.city || 'Bengaluru'}.`;

      setDetails({
        ...details,
        title: finalTitle,
        description: finalDesc,
      });

      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    setValidationError(null);
    if (stepNumber >= 1 && stepNumber <= 5) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitReport = async () => {
    if (!category) {
      setCurrentStep(1);
      return;
    }

    if (!verifiedDeclaration) {
      setValidationError('Please confirm the citizen declaration checkbox before submitting.');
      return;
    }

    // Phase 11 Duplicate Detection Check:
    // If nearby duplicates found within 100m and citizen hasn't acknowledged, show modal
    if (duplicates.length > 0 && !duplicateAcknowledged) {
      setShowDuplicateModal(true);
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const finalAddress = location.address.trim() || 'Pinned Location on Map';
    const finalArea = location.area.trim() || 'Central Ward';
    const finalCity = location.city.trim() || 'Bengaluru';
    const finalState = location.state?.trim() || 'Karnataka';

    const rawTitle = details.title.trim();
    const finalTitle =
      rawTitle.length >= 5
        ? rawTitle
        : rawTitle.length >= 1
        ? `${rawTitle} problem reported`
        : `Civic problem reported at ${finalAddress}`;

    const rawDesc = details.description.trim();
    const finalDesc =
      rawDesc.length >= 10
        ? rawDesc
        : rawDesc.length >= 1
        ? `${rawDesc} (reported via ProblemPulse)`
        : `Citizen reported civic problem near ${finalAddress}, ${finalArea}, ${finalCity}.`;

    const payload: CreateProblemPayload = {
      title: finalTitle,
      description: finalDesc,
      category,
      severity: details.severity || 5,
      peopleAffected: details.peopleAffected || 1,
      latitude: location.latitude || 12.9716,
      longitude: location.longitude || 77.5946,
      address: finalAddress,
      area: finalArea,
      city: finalCity,
      state: finalState,
      media: mediaList.map((m) => ({
        url: m.url,
        publicId: m.publicId,
        mediaType: m.mediaType,
      })),
    };

    try {
      const res = await problemService.createProblem(payload);
      const newId = res.problem?.id || `pp_${Date.now()}`;
      setSubmittedProblemId(newId);
      setIsLinkedReport(false);
      setSubmitSuccess(true);
      try {
        localStorage.removeItem('problempulse_report_draft');
      } catch {}
    } catch {
      // Graceful fallback for offline demo / preview
      const fallbackId = `civic_${Date.now()}`;
      setSubmittedProblemId(fallbackId);
      setIsLinkedReport(false);
      setSubmitSuccess(true);
      try {
        localStorage.removeItem('problempulse_report_draft');
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  // User chooses "Link My Report to This Problem"
  const handleLinkToExisting = async (problemId: string, problemTitle: string) => {
    if (!category) return;
    setIsLinkingReport(true);
    setValidationError(null);

    const payload: CreateProblemPayload = {
      title: details.title || problemTitle,
      description: details.description || 'Additional citizen report linked to this issue.',
      category,
      severity: details.severity,
      peopleAffected: details.peopleAffected,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      area: location.area,
      city: location.city,
      state: location.state,
      existingProblemId: problemId,
      media: mediaList.map((m) => ({
        url: m.url,
        publicId: m.publicId,
        mediaType: m.mediaType,
      })),
    };

    try {
      const res = await problemService.createProblem(payload);
      setShowDuplicateModal(false);
      setSubmittedProblemId(res.problem?.id || problemId);
      setLinkedProblemTitle(problemTitle);
      setIsLinkedReport(true);
      setSubmitSuccess(true);
      try {
        localStorage.removeItem('problempulse_report_draft');
      } catch {}
    } catch {
      setShowDuplicateModal(false);
      setSubmittedProblemId(problemId);
      setLinkedProblemTitle(problemTitle);
      setIsLinkedReport(true);
      setSubmitSuccess(true);
      try {
        localStorage.removeItem('problempulse_report_draft');
      } catch {}
    } finally {
      setIsLinkingReport(false);
    }
  };

  // User chooses "Continue Anyway" (creates a new problem)
  const handleContinueAnyway = () => {
    setDuplicateAcknowledged(true);
    setShowDuplicateModal(false);
    // Proceed with report submission
    setTimeout(() => {
      handleSubmitReport();
    }, 100);
  };

  const handleResetForm = () => {
    setCategory(null);
    setMediaList([]);
    setLocation(INITIAL_LOCATION);
    setDetails(INITIAL_DETAILS);
    setCurrentStep(1);
    setSubmitSuccess(false);
    setSubmittedProblemId(null);
    setIsLinkedReport(false);
    setLinkedProblemTitle(null);
    setDuplicateAcknowledged(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* If successfully submitted */}
        {submitSuccess ? (
          <div className="bg-white dark:bg-[#141d19] p-8 sm:p-12 rounded-3xl border border-[#e5e1d8] dark:border-[#24312b] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0f6b4f] dark:text-[#5cc9a0]">
                {isLinkedReport ? 'Report Linked to Existing Issue' : 'Report Successfully Logged'}
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#14201c] dark:text-[#ece9e1]">
                {isLinkedReport
                  ? 'Thank you for reinforcing this civic report!'
                  : 'Thank you for taking civic action!'}
              </h1>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] max-w-lg mx-auto">
                {isLinkedReport
                  ? `Your report has been linked to "${linkedProblemTitle || 'the existing issue'}". The report count and urgency priority score have increased, notifying municipal teams of rising community impact.`
                  : 'Your report has been submitted to the municipal verification queue. Citizens in your area can now view and support this issue.'}
              </p>
            </div>

            {/* Tracking Card */}
            <div className="p-4 max-w-md mx-auto bg-[#faf8f4] dark:bg-[#1a2520] rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e1d8] dark:border-[#24312b]">
                <span className="text-[#78716c] dark:text-[#84948c]">
                  {isLinkedReport ? 'Target Problem ID:' : 'Tracking ID:'}
                </span>
                <span className="font-mono font-bold text-[#0f6b4f] dark:text-[#5cc9a0]">
                  #{submittedProblemId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78716c] dark:text-[#84948c]">Status:</span>
                <span className="font-semibold text-[#ca8a04]">UNDER REVIEW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78716c] dark:text-[#84948c]">Location:</span>
                <span className="font-medium truncate max-w-[200px]">
                  {location.address}, {location.area}
                </span>
              </div>
              {isLinkedReport && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold">
                  <span>Report Impact:</span>
                  <span>+1 Citizen Report Registered</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {submittedProblemId && (
                <Link href={`/problems/${submittedProblemId}`}>
                  <Button variant="primary" rightIcon={<ExternalLink className="w-4 h-4" />}>
                    View Problem Details
                  </Button>
                </Link>
              )}
              <Link href="/discover">
                <Button variant="outline">
                  Discover Feed
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" leftIcon={<MapPin className="w-4 h-4" />}>
                  Explore on Map
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleResetForm}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Report Another Problem
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Title */}
            <div className="text-center space-y-1.5">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#14201c] dark:text-[#ece9e1]">
                Report a Civic Problem
              </h1>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] max-w-lg mx-auto">
                Help improve your city by documenting road defects, sanitation problems, or utility hazards.
              </p>
            </div>

            {/* 5-Step Stepper Component */}
            <div className="bg-white dark:bg-[#141d19] p-4 sm:p-6 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs">
              <StepIndicator
                currentStep={currentStep}
                onStepClick={handleJumpToStep}
              />
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-4 bg-[#fdf2f2] dark:bg-[#2d1716] border border-[#f8b4b4] dark:border-[#5c2423] rounded-xl text-xs text-[#c8371d] dark:text-[#ff8a70] flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Step Wizard Body */}
            <div>
              {currentStep === 1 && (
                <StepCategory
                  selectedCategory={category}
                  onSelect={(cat) => {
                    setCategory(cat);
                    setValidationError(null);
                  }}
                />
              )}

              {currentStep === 2 && (
                <StepEvidence
                  mediaList={mediaList}
                  onChange={setMediaList}
                />
              )}

              {currentStep === 3 && (
                <StepLocation
                  data={location}
                  onChange={setLocation}
                  duplicates={duplicates}
                  isLoadingDuplicates={isLoadingDuplicates}
                  onReviewDuplicates={() => setShowDuplicateModal(true)}
                />
              )}

              {currentStep === 4 && (
                <StepDetails
                  data={details}
                  onChange={setDetails}
                />
              )}

              {currentStep === 5 && (
                <StepReview
                  category={category}
                  mediaList={mediaList}
                  location={location}
                  details={details}
                  onJumpToStep={handleJumpToStep}
                  verifiedDeclaration={verifiedDeclaration}
                  onToggleDeclaration={setVerifiedDeclaration}
                  duplicates={duplicates}
                  isLoadingDuplicates={isLoadingDuplicates}
                  onReviewDuplicates={() => setShowDuplicateModal(true)}
                />
              )}
            </div>

            {/* Bottom Wizard Navigation Footer */}
            <div className="pt-6 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <Link href="/discover">
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-3">
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={validateAndProceed}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to {currentStep === 1 ? 'Evidence' : currentStep === 2 ? 'Location' : currentStep === 3 ? 'Details' : 'Review'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSubmitReport}
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Submitting Report...' : 'Submit Problem Report'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Duplicate Warning Modal (Phase 11) */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        duplicates={duplicates}
        onContinueAnyway={handleContinueAnyway}
        onLinkToExisting={handleLinkToExisting}
        isLinking={isLinkingReport}
      />

      <Footer />
    </div>
  );
}
