import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ flexShrink: 0 }}>
      <style jsx global>{`
        body {
          background: #F8F7F5;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      <SearchForm />
    </div>
  );
}