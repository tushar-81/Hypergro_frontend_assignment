import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useState, useEffect } from 'react';
import { FormFiller } from "~/components/FormFiller";
import type { Form } from "~/types/form";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.formId ? `Form ${data.formId}` : "Form Not Found" },
    { name: "description", content: "Fill out this form" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  if (!id) {
    throw new Response("Form ID not provided", { status: 400 });
  }

  // In a real application, you would fetch the form from a database
  // For this demo, we'll try to get it from localStorage on the client side
  // Since we can't access localStorage on the server, we'll pass the ID
  // and let the client handle the form loading
  
  return json({ formId: id });
}

function FormLoader({ formId }: { formId: string }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try {
      // Try to load the form from localStorage
      // First try with shared_form_ prefix (for shareable links)
      let savedForm = localStorage.getItem(`shared_form_${formId}`);
      
      // If not found, try with form_ prefix (for other saved forms)
      if (!savedForm) {
        savedForm = localStorage.getItem(`form_${formId}`);
      }
      
      if (savedForm) {
        setForm(JSON.parse(savedForm));
      } else {
        setError("Form not found");
      }
    } catch (err) {
      setError("Error loading form");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }
  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Form Not Found</h1>
          <div className="space-y-3 text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6">
            <p>{error || "The form you're looking for doesn't exist."}</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Why might this happen?</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>• The form link was created on a different device</li>
                <li>• The form was not saved permanently</li>
                <li>• Browser data was cleared</li>
                <li>• The link has expired or is invalid</li>
              </ul>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Tip:</strong> For reliable form sharing across devices, consider setting up a backend database. 
                Forms are currently stored locally in your browser only.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <a 
              href="/" 
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Create New Form
            </a>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <FormFiller form={form} />;
}

export default function FormPage() {
  const { formId } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <FormLoader formId={formId} />
    </div>
  );
}
