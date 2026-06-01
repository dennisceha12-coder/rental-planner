import { flattenFieldErrors, type FieldErrors } from '@/lib/form-errors';

export default function FormErrors({
  errors,
  className = '',
}: {
  errors?: FieldErrors;
  className?: string;
}) {
  const messages = flattenFieldErrors(errors);
  if (messages.length === 0) return null;

  return (
    <div
      className={`rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 ${className}`}
      role="alert"
    >
      <ul className="list-disc pl-4">
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
