import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TEAMS } from "@/lib/teams";

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");

  const teamList = Object.entries(TEAMS).map(([name, logo]) => ({
    name,
    logo,
  }));

  const filteredTeams = teamList.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Teams</h1>
        <p className="text-muted-foreground text-lg">
          Explore all URFL teams and their rosters
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeams.map((team) => (
          <Link key={team.name} href={`/teams/${encodeURIComponent(team.name)}`}>
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center gap-4">
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-20 h-20 object-contain"
                />
                <h3 className="font-bold text-lg">{team.name}</h3>
                <p className="text-xs text-muted-foreground">
                  View roster & stats
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">
            No teams found matching "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  );
}
