import { Tailwind, Button } from "@react-email/components";

export default function MagicLinkTemplate({ token }: { token: string }) {
  return (
    <Tailwind>
      <div className="font-mono">
        <h1 className="text-2xl font-bold">une.haus</h1>
        <p>Click the button below to authenticate and be taken to the app.</p>
        <Button
          href={`https://une.haus?token=${token}`}
          className="rounded-md bg-black px-2.5 py-1.5 font-mono text-white"
        >
          Authenticate
        </Button>
      </div>
    </Tailwind>
  );
}
