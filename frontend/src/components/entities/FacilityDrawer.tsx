import type { Facility } from "@/types/entity"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLink } from "./EntityLink"
import { FacilityMap } from "./FacilityMap"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  MapPin,
  Award,
  Users,
  Mail,
  Phone,
  Clock,
  Calendar,
  Bed,
  ShieldCheck,
  Map,
} from "lucide-react"
import dayjs from "dayjs"

interface FacilityDrawerProps {
  facility: Facility
  loading: boolean
}

export function FacilityDrawer({ facility, loading }: FacilityDrawerProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg" />
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

  if (!facility) {
    return (
      <div>
        <p className="text-muted-foreground text-start">Facility not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Logo/Icon */}
      <div className="flex items-start gap-4 pb-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-500/10">
          <Building2 className="w-12 h-12 text-blue-600/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-foreground mb-1 text-start">
            {facility.facilityName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              {facility.registrationNumber}
            </span>
            {facility.facilityCode && (
              <>
                <span>•</span>
                <span className="font-mono">{facility.facilityCode}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {facility.facilityType && (
              <Badge variant="secondary" className="font-medium">
                {facility.facilityType}
              </Badge>
            )}
            {facility.kephLevel && (
              <Badge variant="outline" className="font-medium">
                {facility.kephLevel}
              </Badge>
            )}
          </div>
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
            <TabsTrigger value="professionals" className="flex-1 min-w-fit whitespace-nowrap">
              <span className="truncate">Professionals</span>
              {facility.affiliations && facility.affiliations.length > 0 && (
                <span className="ml-1.5 text-xs">({facility.affiliations.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex-1 min-w-fit">
              <span className="truncate">Licenses</span>
              {facility.licenses && facility.licenses.length > 0 && (
                <span className="ml-1.5 text-xs">({facility.licenses.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-1 min-w-fit">
              Contact
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 min-w-fit">
              Map
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Facility Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facility.category && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Category</p>
                  <p className="text-sm text-muted-foreground text-start">{facility.category}</p>
                </div>
              </div>
            )}

            {facility.owner && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Owner</p>
                  <p className="text-sm text-muted-foreground text-start">{facility.owner}</p>
                </div>
              </div>
            )}

            {facility.numberOfBeds && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Bed className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Number of Beds</p>
                  <p className="text-sm text-muted-foreground text-start">
                    {facility.numberOfBeds}
                  </p>
                </div>
              </div>
            )}

            {(facility.county || facility.subCounty || facility.ward) && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Location</p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    {facility.county && <p className="text-start">{facility.county} County</p>}
                    {facility.subCounty && (
                      <p className="text-xs text-start">{facility.subCounty} Sub-County</p>
                    )}
                    {facility.ward && <p className="text-xs text-start">{facility.ward} Ward</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours */}
          {(facility.openWholeDay !== undefined ||
            facility.openWeekends !== undefined ||
            facility.openPublicHoliday !== undefined) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-foreground text-start">
                  Operating Hours
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                {facility.openWholeDay !== undefined && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        facility.openWholeDay ? "bg-green-500" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="text-muted-foreground">24/7 Service</span>
                  </div>
                )}
                {facility.openWeekends !== undefined && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        facility.openWeekends ? "bg-green-500" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="text-muted-foreground">Open Weekends</span>
                  </div>
                )}
                {facility.openPublicHoliday !== undefined && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        facility.openPublicHoliday ? "bg-green-500" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="text-muted-foreground">Open Holidays</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="professionals" className="space-y-3 mt-0">
          {facility.affiliations && facility.affiliations.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground text-start">
                  Affiliated Professionals
                </h3>
              </div>
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start">Professional Name</TableHead>
                      <TableHead className="text-start">Role</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facility.affiliations.map((affiliation, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-start">
                          {affiliation.professionalRegistrationNumber ? (
                            <EntityLink
                              type="professional"
                              id={affiliation.professionalRegistrationNumber}
                            >
                              {affiliation.professionalName || "Unknown Professional"}
                            </EntityLink>
                          ) : (
                            affiliation.professionalName || "Unknown Professional"
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
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No affiliated professionals found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="licenses" className="space-y-3 mt-0">
          {facility.licenses && facility.licenses.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground text-start">
                  Active Licenses
                </h3>
              </div>
              <div className="space-y-2">
                {facility.licenses.map((license, index) => (
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
                          <p className="text-sm text-muted-foreground flex items-center gap-1 text-start">
                            <Calendar className="w-4 h-4" />
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
            {facility.telephoneNumber && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 text-start">
                    Phone Number
                  </p>
                  <a
                    href={`tel:${facility.telephoneNumber}`}
                    className="text-sm text-primary hover:underline text-start block"
                  >
                    {facility.telephoneNumber}
                  </a>
                </div>
              </div>
            )}

            {facility.officialEmail && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 text-start">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${facility.officialEmail}`}
                    className="text-sm text-primary hover:underline break-all text-start block"
                  >
                    {facility.officialEmail}
                  </a>
                </div>
              </div>
            )}

            {facility.physicalAddress && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 text-start">
                    Physical Address
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line text-start">
                    {facility.physicalAddress}
                  </p>
                </div>
              </div>
            )}

            {!facility.telephoneNumber && !facility.officialEmail && !facility.physicalAddress && (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No contact information available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground text-start">Facility Location</h3>
          </div>
          <FacilityMap
            facilityName={facility.facilityName}
            latitude={undefined}
            longitude={undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
