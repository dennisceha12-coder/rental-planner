'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { parseDateInput } from '@/lib/dates';
import { generateQuoteNumber } from '@/lib/quotes';
import {
  clientSchema,
  equipmentCategorySchema,
  equipmentSchema,
  projectSchema,
  projectLineSchema,
  projectFinancialSchema,
  projectLineDiscountSchema,
  crewShiftSchema,
  companySettingsSchema,
  staffSchema,
} from '@/lib/validators';
import { parseStaffIds } from '@/lib/crew';
import { getCompanySettings } from '@/lib/company-settings';

function revalidateAll(projectId?: string) {
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/staff');
  revalidatePath('/settings');
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/print/${projectId}/offerte`);
    revalidatePath(`/print/${projectId}/callsheet`);
    revalidatePath(`/print/${projectId}/materiaallijst`);
    revalidatePath(`/print/${projectId}/inhuur`);
    revalidatePath(`/print/${projectId}/personeel`);
  }
}

// ——— Clients ———

export async function createClient(formData: FormData) {
  const parsed = clientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
    vatNumber: formData.get('vatNumber') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const client = await prisma.client.create({ data: parsed.data });
  revalidateAll();
  return { clientId: client.id };
}

// ——— Equipment categories ———

export async function createEquipmentCategory(formData: FormData) {
  const parsed = equipmentCategorySchema.safeParse({
    name: formData.get('name'),
    sortOrder: formData.get('sortOrder') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  let sortOrder = parsed.data.sortOrder;
  if (sortOrder == null) {
    const max = await prisma.equipmentCategory.aggregate({ _max: { sortOrder: true } });
    sortOrder = (max._max.sortOrder ?? -1) + 1;
  }

  await prisma.equipmentCategory.create({
    data: { name: parsed.data.name.trim(), sortOrder },
  });
  revalidatePath('/catalog');
  return { ok: true };
}

export async function updateEquipmentCategory(id: string, formData: FormData) {
  const parsed = equipmentCategorySchema.safeParse({
    name: formData.get('name'),
    sortOrder: formData.get('sortOrder') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data: { name: string; sortOrder?: number } = { name: parsed.data.name.trim() };
  if (parsed.data.sortOrder != null) data.sortOrder = parsed.data.sortOrder;

  await prisma.equipmentCategory.update({ where: { id }, data });
  revalidatePath('/catalog');
  revalidateAll();
  return { ok: true };
}

export async function deleteEquipmentCategory(id: string) {
  const used = await prisma.equipment.count({ where: { categoryId: id } });
  if (used > 0) {
    return {
      error: `Categorie is gekoppeld aan ${used} materiaalitem(s) en kan niet worden verwijderd.`,
    };
  }
  await prisma.equipmentCategory.delete({ where: { id } });
  revalidatePath('/catalog');
  return { ok: true };
}

// ——— Equipment ———

export async function createEquipment(formData: FormData) {
  const stockRaw = formData.get('stockQty');
  const parsed = equipmentSchema.safeParse({
    name: formData.get('name'),
    categoryId: formData.get('categoryId') || undefined,
    dailyRate: formData.get('dailyRate'),
    stockQty: stockRaw === '' || stockRaw === null ? '' : stockRaw,
    isExternalRental: formData.get('isExternalRental'),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { stockQty, ...rest } = parsed.data;
  await prisma.equipment.create({
    data: {
      ...rest,
      stockQty: stockQty === '' || stockQty === undefined ? null : Number(stockQty),
    },
  });
  revalidatePath('/catalog');
  return { ok: true };
}

export async function updateEquipment(id: string, formData: FormData) {
  const stockRaw = formData.get('stockQty');
  const parsed = equipmentSchema.safeParse({
    name: formData.get('name'),
    categoryId: formData.get('categoryId') || undefined,
    dailyRate: formData.get('dailyRate'),
    stockQty: stockRaw === '' || stockRaw === null ? '' : stockRaw,
    isExternalRental: formData.get('isExternalRental'),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { stockQty, ...rest } = parsed.data;
  await prisma.equipment.update({
    where: { id },
    data: {
      ...rest,
      stockQty: stockQty === '' || stockQty === undefined ? null : Number(stockQty),
    },
  });
  revalidatePath('/catalog');
  return { ok: true };
}

export async function deleteEquipment(id: string) {
  const used = await prisma.projectLine.count({ where: { equipmentId: id } });
  if (used > 0) {
    return { error: 'Materiaal is gekoppeld aan projecten en kan niet worden verwijderd.' };
  }
  await prisma.equipment.delete({ where: { id } });
  revalidatePath('/catalog');
  return { ok: true };
}

// ——— Projects ———

export async function createProject(formData: FormData) {
  const clientId = String(formData.get('clientId') ?? '');
  const newClientName = String(formData.get('newClientName') ?? '').trim();

  let resolvedClientId = clientId;
  if (!resolvedClientId && newClientName) {
    const c = await prisma.client.create({ data: { name: newClientName } });
    resolvedClientId = c.id;
  }
  if (!resolvedClientId) {
    return { error: { clientId: ['Kies een klant of voer een nieuwe klantnaam in'] } };
  }

  const quoteNumber =
    String(formData.get('quoteNumber') ?? '').trim() ||
    (await generateQuoteNumber());

  const parsed = projectSchema.safeParse({
    title: formData.get('title'),
    status: formData.get('status') || 'CONCEPT',
    quoteNumber,
    clientId: resolvedClientId,
    location: formData.get('location') || undefined,
    loadIn: formData.get('loadIn') || undefined,
    showDate: formData.get('showDate') || undefined,
    loadOut: formData.get('loadOut') || undefined,
    loadInTime: formData.get('loadInTime') || undefined,
    showTime: formData.get('showTime') || undefined,
    loadOutTime: formData.get('loadOutTime') || undefined,
    siteContact: formData.get('siteContact') || undefined,
    parkingNotes: formData.get('parkingNotes') || undefined,
    notes: formData.get('notes') || undefined,
    hourlyRate: formData.get('hourlyRate') ?? '',
    transportType: formData.get('transportType') ?? 'PER_KM',
    transportKm: formData.get('transportKm') ?? '',
    transportRatePerKm: formData.get('transportRatePerKm') ?? '',
    transportFixedAmount: formData.get('transportFixedAmount') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { loadIn, showDate, loadOut, ...data } = parsed.data;
  const project = await prisma.project.create({
    data: {
      ...data,
      loadIn: parseDateInput(loadIn),
      showDate: parseDateInput(showDate),
      loadOut: parseDateInput(loadOut),
    },
  });
  revalidateAll(project.id);
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const parsed = projectSchema.safeParse({
    title: formData.get('title'),
    status: formData.get('status'),
    quoteNumber: formData.get('quoteNumber') || undefined,
    clientId: formData.get('clientId'),
    location: formData.get('location') || undefined,
    loadIn: formData.get('loadIn') || undefined,
    showDate: formData.get('showDate') || undefined,
    loadOut: formData.get('loadOut') || undefined,
    loadInTime: formData.get('loadInTime') || undefined,
    showTime: formData.get('showTime') || undefined,
    loadOutTime: formData.get('loadOutTime') || undefined,
    siteContact: formData.get('siteContact') || undefined,
    parkingNotes: formData.get('parkingNotes') || undefined,
    notes: formData.get('notes') || undefined,
    hourlyRate: formData.get('hourlyRate') ?? '',
    transportType: formData.get('transportType') ?? 'PER_KM',
    transportKm: formData.get('transportKm') ?? '',
    transportRatePerKm: formData.get('transportRatePerKm') ?? '',
    transportFixedAmount: formData.get('transportFixedAmount') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { loadIn, showDate, loadOut, ...data } = parsed.data;
  await prisma.project.update({
    where: { id },
    data: {
      ...data,
      loadIn: parseDateInput(loadIn),
      showDate: parseDateInput(showDate),
      loadOut: parseDateInput(loadOut),
    },
  });
  revalidateAll(id);
  return { ok: true };
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidateAll();
  redirect('/');
}

export async function updateProjectFinancial(formData: FormData) {
  const parsed = projectFinancialSchema.safeParse({
    projectId: formData.get('projectId'),
    totalDiscountAmount: formData.get('totalDiscountAmount') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const amount =
    parsed.data.totalDiscountAmount != null && parsed.data.totalDiscountAmount > 0
      ? parsed.data.totalDiscountAmount
      : null;

  await prisma.project.update({
    where: { id: parsed.data.projectId },
    data: { totalDiscountAmount: amount },
  });
  revalidateAll(parsed.data.projectId);
  return { ok: true };
}

// ——— Project lines ———

export async function addProjectLine(formData: FormData) {
  const parsed = projectLineSchema.safeParse({
    projectId: formData.get('projectId'),
    lineType: formData.get('lineType') ?? 'catalog',
    equipmentId: formData.get('equipmentId') || undefined,
    customName: formData.get('customName') || undefined,
    customDailyRate: formData.get('customDailyRate') || undefined,
    quantity: formData.get('quantity'),
    rentalStart: formData.get('rentalStart'),
    rentalEnd: formData.get('rentalEnd'),
    discountType: formData.get('discountType') ?? '',
    discountValue: formData.get('discountValue') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const start = parseDateInput(parsed.data.rentalStart);
  const end = parseDateInput(parsed.data.rentalEnd);
  if (!start || !end) {
    return { error: { rentalStart: ['Ongeldige datums'] } };
  }
  if (end < start) {
    return { error: { rentalEnd: ['Einddatum moet op of na startdatum liggen'] } };
  }

  const {
    projectId,
    equipmentId,
    customName,
    customDailyRate,
    quantity,
    discountType,
    discountValue,
  } = parsed.data;
  await prisma.projectLine.create({
    data: {
      projectId,
      equipmentId,
      customName,
      customDailyRate,
      quantity,
      rentalStart: start,
      rentalEnd: end,
      discountType,
      discountValue,
    },
  });
  revalidateAll(projectId);
  return { ok: true };
}

export async function updateProjectLine(lineId: string, formData: FormData) {
  const parsed = projectLineSchema.safeParse({
    projectId: formData.get('projectId'),
    lineType: formData.get('lineType') ?? 'catalog',
    equipmentId: formData.get('equipmentId') || undefined,
    customName: formData.get('customName') || undefined,
    customDailyRate: formData.get('customDailyRate') || undefined,
    quantity: formData.get('quantity'),
    rentalStart: formData.get('rentalStart'),
    rentalEnd: formData.get('rentalEnd'),
    discountType: formData.get('discountType') ?? '',
    discountValue: formData.get('discountValue') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const start = parseDateInput(parsed.data.rentalStart);
  const end = parseDateInput(parsed.data.rentalEnd);
  if (!start || !end) {
    return { error: { rentalStart: ['Ongeldige datums'] } };
  }

  await prisma.projectLine.update({
    where: { id: lineId },
    data: {
      equipmentId: parsed.data.equipmentId,
      customName: parsed.data.customName,
      customDailyRate: parsed.data.customDailyRate,
      quantity: parsed.data.quantity,
      rentalStart: start,
      rentalEnd: end,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
    },
  });
  revalidateAll(parsed.data.projectId);
  return { ok: true };
}

export async function updateProjectLineDiscount(lineId: string, formData: FormData) {
  const parsed = projectLineDiscountSchema.safeParse({
    projectId: formData.get('projectId'),
    discountType: formData.get('discountType') ?? '',
    discountValue: formData.get('discountValue') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await prisma.projectLine.update({
    where: { id: lineId },
    data: {
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
    },
  });
  revalidateAll(parsed.data.projectId);
  return { ok: true };
}

export async function deleteProjectLine(lineId: string, projectId: string) {
  await prisma.projectLine.delete({ where: { id: lineId } });
  revalidateAll(projectId);
  return { ok: true };
}

// ——— Crew / personeelsplanning ———

async function syncShiftStaff(shiftId: string, staffIds: string[]) {
  await prisma.crewShiftStaff.deleteMany({ where: { shiftId } });
  if (staffIds.length === 0) return;
  await prisma.crewShiftStaff.createMany({
    data: staffIds.map((staffId) => ({ shiftId, staffId })),
  });
}

export async function addCrewShift(formData: FormData) {
  const parsed = crewShiftSchema.safeParse({
    projectId: formData.get('projectId'),
    phase: formData.get('phase'),
    role: formData.get('role') || undefined,
    headcount: formData.get('headcount'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    hourlyRate: formData.get('hourlyRate') ?? '',
    staffIds: formData.get('staffIds') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const date = parseDateInput(parsed.data.date);
  if (!date) return { error: { date: ['Ongeldige datum'] } };

  const staffIds = parseStaffIds(parsed.data.staffIds ?? '');
  const { projectId, date: _d, hourlyRate, staffIds: _s, ...rest } = parsed.data;
  const shift = await prisma.crewShift.create({
    data: {
      ...rest,
      projectId,
      date,
      hourlyRate,
      headcount: staffIds.length > 0 ? Math.max(rest.headcount, staffIds.length) : rest.headcount,
    },
  });
  await syncShiftStaff(shift.id, staffIds);
  revalidateAll(projectId);
  return { ok: true };
}

export async function updateCrewShift(shiftId: string, formData: FormData) {
  const parsed = crewShiftSchema.safeParse({
    projectId: formData.get('projectId'),
    phase: formData.get('phase'),
    role: formData.get('role') || undefined,
    headcount: formData.get('headcount'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    hourlyRate: formData.get('hourlyRate') ?? '',
    staffIds: formData.get('staffIds') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const date = parseDateInput(parsed.data.date);
  if (!date) return { error: { date: ['Ongeldige datum'] } };

  const staffIds = parseStaffIds(parsed.data.staffIds ?? '');
  const { projectId, date: _d, hourlyRate, staffIds: _s, ...rest } = parsed.data;
  await prisma.crewShift.update({
    where: { id: shiftId },
    data: {
      ...rest,
      date,
      hourlyRate,
      headcount: staffIds.length > 0 ? Math.max(rest.headcount, staffIds.length) : rest.headcount,
    },
  });
  await syncShiftStaff(shiftId, staffIds);
  revalidateAll(projectId);
  return { ok: true };
}

export async function deleteCrewShift(shiftId: string, projectId: string) {
  await prisma.crewShift.delete({ where: { id: shiftId } });
  revalidateAll(projectId);
  return { ok: true };
}

export async function updateProjectHourlyRate(projectId: string, formData: FormData) {
  const hourlyRateRaw = formData.get('hourlyRate');
  const hourlyRate =
    hourlyRateRaw === '' || hourlyRateRaw === null
      ? null
      : Number(hourlyRateRaw);
  await prisma.project.update({
    where: { id: projectId },
    data: { hourlyRate: hourlyRate != null && Number.isFinite(hourlyRate) ? hourlyRate : null },
  });
  revalidateAll(projectId);
  return { ok: true };
}

// ——— Company settings ———

export async function updateCompanySettings(formData: FormData) {
  const parsed = companySettingsSchema.safeParse({
    companyName: formData.get('companyName'),
    address: formData.get('address'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    kvkNumber: formData.get('kvkNumber') || undefined,
    vatNumber: formData.get('vatNumber') || undefined,
    iban: formData.get('iban') || undefined,
    quoteValidityDays: formData.get('quoteValidityDays'),
    defaultVatRate: formData.get('defaultVatRate'),
    paymentTerms: formData.get('paymentTerms') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await getCompanySettings();
  await prisma.companySettings.update({
    where: { id: 'default' },
    data: parsed.data,
  });
  revalidatePath('/settings');
  revalidateAll();
  return { ok: true };
}

// ——— Staff catalog ———

export async function createStaff(formData: FormData) {
  const parsed = staffSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role') || undefined,
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await prisma.staff.create({ data: parsed.data });
  revalidatePath('/staff');
  return { ok: true };
}

export async function updateStaff(id: string, formData: FormData) {
  const parsed = staffSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role') || undefined,
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await prisma.staff.update({ where: { id }, data: parsed.data });
  revalidatePath('/staff');
  revalidateAll();
  return { ok: true };
}

export async function deleteStaff(id: string) {
  const used = await prisma.crewShiftStaff.count({ where: { staffId: id } });
  if (used > 0) {
    return { error: 'Teamleden met geplande shifts kunnen niet worden verwijderd.' };
  }
  await prisma.staff.delete({ where: { id } });
  revalidatePath('/staff');
  return { ok: true };
}
