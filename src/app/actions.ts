'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { parseDateInput } from '@/lib/dates';
import { generateQuoteNumber } from '@/lib/quotes';
import {
  clientSchema,
  equipmentSchema,
  projectSchema,
  projectLineSchema,
} from '@/lib/validators';

function revalidateAll(projectId?: string) {
  revalidatePath('/');
  revalidatePath('/catalog');
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/print/${projectId}/offerte`);
    revalidatePath(`/print/${projectId}/callsheet`);
    revalidatePath(`/print/${projectId}/materiaallijst`);
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

// ——— Equipment ———

export async function createEquipment(formData: FormData) {
  const stockRaw = formData.get('stockQty');
  const parsed = equipmentSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category') || undefined,
    dailyRate: formData.get('dailyRate'),
    stockQty: stockRaw === '' || stockRaw === null ? '' : stockRaw,
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
    category: formData.get('category') || undefined,
    dailyRate: formData.get('dailyRate'),
    stockQty: stockRaw === '' || stockRaw === null ? '' : stockRaw,
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
    return { error: 'Materiaal is gekoppeld aan klussen en kan niet worden verwijderd.' };
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

// ——— Project lines ———

export async function addProjectLine(formData: FormData) {
  const parsed = projectLineSchema.safeParse({
    projectId: formData.get('projectId'),
    equipmentId: formData.get('equipmentId'),
    quantity: formData.get('quantity'),
    rentalStart: formData.get('rentalStart'),
    rentalEnd: formData.get('rentalEnd'),
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

  const { projectId, equipmentId, quantity } = parsed.data;
  await prisma.projectLine.create({
    data: {
      projectId,
      equipmentId,
      quantity,
      rentalStart: start,
      rentalEnd: end,
    },
  });
  revalidateAll(projectId);
  return { ok: true };
}

export async function updateProjectLine(lineId: string, formData: FormData) {
  const parsed = projectLineSchema.safeParse({
    projectId: formData.get('projectId'),
    equipmentId: formData.get('equipmentId'),
    quantity: formData.get('quantity'),
    rentalStart: formData.get('rentalStart'),
    rentalEnd: formData.get('rentalEnd'),
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
      quantity: parsed.data.quantity,
      rentalStart: start,
      rentalEnd: end,
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
