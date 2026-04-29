/**
 * GreetingSection
 * Shows "Hi, {firstName}!" + a subtitle with destination count.
 *
 * Props:
 *   user  {object|null}  auth user object — expects user.name or user.displayName
 */
export default function GreetingSection({ user }) {
  const firstName = user?.name?.split(' ')[0]
    || user?.displayName?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Traveler';

  return (
    <div className="px-5 pt-4 pb-2 bg-white">
      <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight">
        Hi, {firstName}!
      </h1>
      <p className="mt-0.5 text-sm text-gray-400">
        Where to{' '}
        <span className="font-semibold text-sky-500 cursor-pointer hover:underline">
          56 Paris →
        </span>
      </p>
    </div>
  );
}
