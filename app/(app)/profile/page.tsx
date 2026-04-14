"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, User } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const profileData = useQuery(api.profiles.getMyProfile);
  const upsertProfile = useMutation(api.profiles.upsertMyProfile);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profileData && !loaded) {
      const p = profileData.profile;
      const u = profileData.user;
      setFirstName(p?.firstName ?? u?.firstName ?? "");
      setLastName(p?.lastName ?? u?.lastName ?? "");
      setHeadline(p?.headline ?? "");
      setBio(p?.bio ?? "");
      setLocation(p?.location ?? "");
      setPhone(p?.phone ?? "");
      setWebsite(p?.website ?? "");
      setGithubUrl(p?.githubUrl ?? "");
      setSkills((p?.skills ?? []).join(", "));
      setCompanyName(p?.companyName ?? "");
      setIsDeveloper(p?.isDeveloper ?? false);
      setLoaded(true);
    }
  }, [profileData, loaded]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await upsertProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        skills: skillsArray,
        companyName: companyName.trim() || undefined,
        isDeveloper,
      });
      toast.success("Profile saved!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (profileData === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-secondary" />
        <div className="h-40 rounded bg-secondary" />
      </div>
    );
  }

  return (
    <section className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your profile up to date so people know who they are working with.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
            <User className="size-4 text-jade" />
            Basic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">First Name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Last Name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Headline</label>
            <Input
              placeholder="e.g. Full-Stack Developer or Business Owner"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">About me</label>
            <Textarea
              placeholder="A short description about yourself"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Location</label>
              <Input
                placeholder="e.g. Dhaka, Bangladesh"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <Input
                placeholder="e.g. +880..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Website</label>
              <Input
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">GitHub URL</label>
              <Input
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Skills</label>
            <Input
              placeholder="React, Node.js, Python (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Helps request posters see what you can do.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Company / Organization (optional)
            </label>
            <Input
              placeholder="Leave blank if individual"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              If you represent a company, enter its name here.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Checkbox
              id="isDeveloper"
              checked={isDeveloper}
              onCheckedChange={(checked) => setIsDeveloper(checked === true)}
            />
            <label htmlFor="isDeveloper" className="cursor-pointer text-sm font-medium">
              I am a developer (I want to send proposals)
            </label>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-jade text-white hover:bg-jade/90"
          >
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
