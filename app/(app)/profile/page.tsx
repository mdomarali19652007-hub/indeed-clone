"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillTagInput } from "@/components/skill-tag-input";
import { PageHeader } from "@/components/page-header";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Check, Code2, Save, Settings, User } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
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
  const [skills, setSkills] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSkills(p?.skills ?? []);
      setCompanyName(p?.companyName ?? "");
      setIsDeveloper(p?.isDeveloper ?? false);
      setLoaded(true);
    }
  }, [profileData, loaded]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await upsertProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        skills,
        companyName: companyName.trim() || undefined,
        isDeveloper,
      });
      toast.success("Profile saved!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (profileData === undefined) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.section
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl space-y-6"
    >
      <PageHeader
        title="My Profile"
        description="Keep your profile up to date so people know who they are working with."
      />

      {/* Avatar card */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Avatar className="size-16">
                <AvatarImage src={clerkUser?.imageUrl} />
                <AvatarFallback className="bg-jade/10 text-lg font-bold text-jade">
                  {firstName?.[0] ?? clerkUser?.firstName?.[0] ?? "?"}
                  {lastName?.[0] ?? clerkUser?.lastName?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <p className="font-(family-name:--font-bricolage) text-lg font-bold">
                {firstName || clerkUser?.firstName}{" "}
                {lastName || clerkUser?.lastName}
              </p>
              {headline && (
                <p className="text-sm text-muted-foreground">{headline}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="gap-1.5">
              <User className="size-3.5" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-1.5">
              <Code2 className="size-3.5" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5">
              <Settings className="size-3.5" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
                  <User className="size-4 text-jade" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Headline
                  </label>
                  <Input
                    placeholder="e.g. Full-Stack Developer or Business Owner"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    About me
                  </label>
                  <Textarea
                    placeholder="A short description about yourself"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Location
                    </label>
                    <Input
                      placeholder="e.g. Dhaka, Bangladesh"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      placeholder="e.g. +880..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="developer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
                  <Code2 className="size-4 text-jade" />
                  Developer Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Checkbox
                    id="isDeveloper"
                    checked={isDeveloper}
                    onCheckedChange={(checked) =>
                      setIsDeveloper(checked === true)
                    }
                  />
                  <label
                    htmlFor="isDeveloper"
                    className="cursor-pointer text-sm font-medium"
                  >
                    I am a developer (I want to send proposals)
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Skills
                  </label>
                  <SkillTagInput
                    value={skills}
                    onChange={setSkills}
                    placeholder="React, Node.js, Python"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Website
                    </label>
                    <Input
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      GitHub URL
                    </label>
                    <Input
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
                  <Settings className="size-4 text-jade" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Save button */}
      <motion.div variants={fadeInUp}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-full bg-jade text-white hover:bg-jade/90"
        >
          <AnimatePresence mode="wait" initial={false}>
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center text-white"
              >
                <Check className="mr-2 size-4" />
                Saved!
              </motion.span>
            ) : saving ? (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                Saving...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <Save className="mr-2 size-4" />
                Save Profile
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </motion.section>
  );
}
