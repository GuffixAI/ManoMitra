// web/app/(dashboard)/help/page.tsx
"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, LifeBuoy } from "lucide-react";

const faqs = [
  {
    question: "How do I book a session with a counsellor?",
    answer: "Navigate to the 'Bookings' section from your dashboard. From there, you can view available counsellors and their schedules to book a new session."
  },
  {
    question: "Is my information kept confidential?",
    answer: "Yes. All your reports, bookings, and personal information are kept strictly confidential and are only accessible to authorized personnel."
  },
  {
    question: "What is the difference between a counsellor and a volunteer?",
    answer: "Counsellors are certified professionals who provide structured therapy and support. Volunteers are trained peers who moderate support rooms and offer peer-to-peer guidance."
  },
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. You will receive an email with instructions to set a new password."
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or contact support for further assistance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>If you can't find an answer, please reach out to us.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary"/>
              <div>
                <h4 className="font-semibold">Email Support</h4>
                <p className="text-sm text-muted-foreground">support@manomitra.com</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <LifeBuoy className="h-6 w-6 text-primary"/>
              <div>
                <h4 className="font-semibold">Emergency Helpline</h4>
                <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}