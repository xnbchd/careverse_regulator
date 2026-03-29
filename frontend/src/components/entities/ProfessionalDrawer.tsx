import type { Professional } from "@/types/entity"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLink } from "./EntityLink"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  User,
  Briefcase,
  Award,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  GraduationCap,
} from "lucide-react"
import dayjs from "dayjs"

interface ProfessionalDrawerProps {
  professional: Professional
  loading: boolean
}

export function ProfessionalDrawer({ professional, loading }: ProfessionalDrawerProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-muted rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div>
        <p className="text-muted-foreground text-start">Professional not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Photo */}
      <div className="flex items-start gap-4 pb-4">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-primary/10">
          <User className="w-12 h-12 text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-foreground mb-1 text-start">
            {professional.fullName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <IdCard className="w-4 h-4" />
              {professional.registrationNumber}
            </span>
            {professional.gender && (
              <>
                <span>•</span>
                <span>{professional.gender}</span>
              </>
            )}
            {professional.dateOfBirth && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {dayjs(professional.dateOfBirth).format("DD/MM/YYYY")}
                </span>
              </>
            )}
          </div>
          {professional.professionalCadre && (
            <Badge variant="secondary" className="font-medium">
              {professional.professionalCadre}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto -mx-6 px-6 mb-4">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="overview" className="flex-1 min-w-fit">
              Overview
            </TabsTrigger>
            <TabsTrigger value="affiliations" className="flex-1 min-w-fit">
              <span className="truncate">Affiliations</span>
              {professional.affiliations && professional.affiliations.length > 0 && (
                <span className="ml-1.5 text-xs">({professional.affiliations.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex-1 min-w-fit">
              <span className="truncate">Licenses</span>
              {professional.licenses && professional.licenses.length > 0 && (
                <span className="ml-1.5 text-xs">({professional.licenses.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-1 min-w-fit">
              Contact
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Professional Details */}
          <div className="space-y-3">
            {professional.specialty && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Specialty</p>
                  <p className="text-sm text-muted-foreground text-start">
                    {professional.specialty}
                  </p>
                  {professional.subSpecialty && (
                    <p className="text-xs text-muted-foreground mt-1 text-start">
                      Sub-specialty: {professional.subSpecialty}
                    </p>
                  )}
                </div>
              </div>
            )}

            {professional.typeOfPractice && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Type of Practice</p>
                  <p className="text-sm text-muted-foreground text-start">
                    {professional.typeOfPractice}
                  </p>
                </div>
              </div>
            )}

            {professional.licenseNumber && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">License Number</p>
                  <EntityLink type="license" id={professional.licenseNumber}>
                    <span className="text-sm text-muted-foreground font-mono text-start">
                      {professional.licenseNumber}
                    </span>
                  </EntityLink>
                </div>
              </div>
            )}

            {professional.nationality && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Nationality</p>
                  <p className="text-sm text-muted-foreground text-start">
                    {professional.nationality}
                  </p>
                  {professional.county && (
                    <p className="text-xs text-muted-foreground mt-1 text-start">
                      County: {professional.county}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="affiliations" className="space-y-3 mt-0">
          {professional.affiliations && professional.affiliations.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground text-start">
                  Current Affiliations
                </h3>
              </div>
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start">Facility Name</TableHead>
                      <TableHead className="text-start">Role</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professional.affiliations.map((affiliation, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-start">
                          {affiliation.facilityRegistrationNumber ? (
                            <EntityLink type="facility" id={affiliation.facilityRegistrationNumber}>
                              {affiliation.facilityName || "Unknown Facility"}
                            </EntityLink>
                          ) : (
                            affiliation.facilityName || "Unknown Facility"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-start">
                          {affiliation.role || "Not specified"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              affiliation.status === "Active"
                                ? "default"
                                : affiliation.status === "Pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {affiliation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No affiliations found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="licenses" className="space-y-3 mt-0">
          {professional.licenses && professional.licenses.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground text-start">
                  Active Licenses
                </h3>
              </div>
              <div className="space-y-2">
                {professional.licenses.map((license, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <EntityLink type="license" id={license.licenseNumber}>
                          <span className="font-medium text-foreground font-mono text-sm mb-1 text-start block">
                            {license.licenseNumber}
                          </span>
                        </EntityLink>
                        {license.expiryDate && (
                          <p className="text-sm text-muted-foreground text-start">
                            Expires: {dayjs(license.expiryDate, "YYYY-MM-DD").format("DD MMM YYYY")}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={license.status === "Active" ? "default" : "outline"}
                        className="flex-shrink-0"
                      >
                        {license.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No licenses found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-3 mt-0">
          <div className="space-y-3">
            {professional.emailAddress && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 text-start">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${professional.emailAddress}`}
                    className="text-sm text-primary hover:underline break-all text-start block"
                  >
                    {professional.emailAddress}
                  </a>
                </div>
              </div>
            )}

            {professional.phoneNumber && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 text-start">
                    Phone Number
                  </p>
                  <a
                    href={`tel:${professional.phoneNumber}`}
                    className="text-sm text-primary hover:underline text-start block"
                  >
                    {professional.phoneNumber}
                  </a>
                </div>
              </div>
            )}

            {professional.postalAddress && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 text-start">
                    Postal Address
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line text-start">
                    {professional.postalAddress}
                  </p>
                </div>
              </div>
            )}

            {!professional.emailAddress &&
              !professional.phoneNumber &&
              !professional.postalAddress && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No contact information available</p>
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
