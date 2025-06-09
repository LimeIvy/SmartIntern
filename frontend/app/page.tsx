import { Button } from "@/components/ui/button";
import Header from "@/components/header";

export default function Home() {
  return (
    <div>
      <Header />
      <Button>Click me</Button>
      <h1 className="sm:text-4xl focus:text-4xl text-2xl font-bold">Hello World</h1>
    </div>
  );
}
