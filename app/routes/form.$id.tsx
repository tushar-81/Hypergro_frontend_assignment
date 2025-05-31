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
      const savedForm = localStorage.getItem(`form_${formId}`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The form you're looking for doesn't exist."}</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Form Builder
          </a>
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
