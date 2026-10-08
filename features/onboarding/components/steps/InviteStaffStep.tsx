'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, X } from 'lucide-react';

interface InviteStaffStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function InviteStaffStep({ onNext, onBack }: InviteStaffStepProps) {
  const [emails, setEmails] = useState<string[]>(['']);

  const addEmailField = () => setEmails((prev) => [...prev, '']);
  const removeEmailField = (index: number) =>
    setEmails((prev) => prev.filter((_, i) => i !== index));
  const updateEmail = (index: number, value: string) =>
    setEmails((prev) =>
      prev.map((email, i) => (i === index ? value : email))
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Invite Your Team
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add staff members to help manage your business (Optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start gap-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Why invite staff?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Staff members can help you manage orders, products, and customer service. You can assign different roles and permissions to each team member.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  Manage orders and products
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  Handle customer support
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  Access analytics and reports
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Invite Team Members
          </h3>
          <div className="space-y-3">
            {emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`email-${index}`} className="sr-only">
                    Email Address
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="team@example.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                  />
                </div>
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmailField(index)}
                    className="shrink-0"
                    aria-label="Remove email"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailField}
              className="mt-2"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Another
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Nothing is sent from this step. After setup you can invite your team from your
            dashboard at any time, and they&apos;ll get an email then.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> Each team member gets their own login, and you decide what they can see and do.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}