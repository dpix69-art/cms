import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import Field from "../../components/Field";
import type { Site, Series } from "../../lib/schema";

type Props = {
  site: Site;
  series: Series[];
  onChange: (nextSite: Site) => void;
};

type OptionValue = `${string}::${string}`; // "seriesSlug::workSlug"

export default function HomeSettingsEditor({ site, series, onChange }: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<Site>({
    defaultValues: site,
  });

  // Плоский список всех работ (для двух селектов)
  const allWorkOptions = useMemo(() => {
    const opts: { value: OptionValue; label: string }[] = [];
    for (const s of series || []) {
      for (const w of s.works || []) {
        const label = `${s.title || s.slug} — ${w.title || w.slug}${
          w.year ? ` (${w.year})` : ""
        }`;
        const value = `${s.slug}::${w.slug}` as OptionValue;
        opts.push({ value, label });
      }
    }
    return opts;
  }, [series]);

  // Текущее значение (макс. 2)
  const featured = watch("homeFeatured") || [];

  const parseVal = (v: string | undefined | null) => {
    if (!v) return undefined;
    const [series, work] = v.split("::");
    if (!series || !work) return undefined;
    return { series, work };
  };

  const valueOf = (idx: number): OptionValue | "" => {
    const f = featured[idx];
    return f ? (`${f.series}::${f.work}` as OptionValue) : "";
  };

  const setFeatured = (idx: number, v: OptionValue | "") => {
    const next = [...featured];
    if (!v) next[idx] = undefined as any;
    else {
      const parsed = parseVal(v);
      if (!parsed) return;
      next[idx] = parsed as any;
    }
    const cleaned = next.filter(Boolean).slice(0, 2) as any;
    setValue("homeFeatured", cleaned, { shouldDirty: true });
  };

  const onSubmit = (data: Site) => {
    // Чистим дубли и пустые
    const seen = new Set<string>();
    const hf = (data.homeFeatured || [])
      .filter((f) => f?.series && f?.work)
      .filter((f) => {
        const key = `${f.series}::${f.work}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 2);

    onChange({ ...site, ...data, homeFeatured: hf });
  };

  const options = allWorkOptions.map((o) => (
    <option key={o.value} value={o.value}>
      {o.label}
    </option>
  ));

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground">Home (Featured)</h2>
      <p className="text-muted-foreground mt-2">
        Choose up to two artworks to pin at the top of the homepage. The rest of the cards remain randomized.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
        {/* Базовые поля сайта — можно править здесь же */}
        <div className="grid grid-cols-2 gap-6">
          {/* <Field label="Artist Name">
            <input
              type="text"
              className="input-text"
              {...register("artistName")}
              placeholder="Artist name"
            />
          </Field> */}
          {/* <Field label="Role">
            <input
              type="text"
              className="input-text"
              {...register("role")}
              placeholder="Artist / Painter / ..."
            />
          </Field> */}
        </div>

        {/* <Field label="Statement">
          <textarea
            rows={3}
            className="input-text"
            {...register("statement")}
            placeholder="Short statement"
          />
        </Field> */}

        {/* Featured #1 */}
        <div className="rounded-2xl border p-4 space-y-3">
          <h3 className="text-base font-semibold">Featured #1 (top-left)</h3>
          <select
            className="input-select w-full"
            value={valueOf(0)}
            onChange={(e) => setFeatured(0, e.target.value as OptionValue)}
          >
            <option value="">— none —</option>
            {options}
          </select>
          {valueOf(0) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFeatured(0, "")}
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Featured #2 */}
        <div className="rounded-2xl border p-4 space-y-3">
          <h3 className="text-base font-semibold">Featured #2 (top-right)</h3>
          <select
            className="input-select w-full"
            value={valueOf(1)}
            onChange={(e) => setFeatured(1, e.target.value as OptionValue)}
          >
            <option value="">— none —</option>
            {options}
          </select>
          {valueOf(1) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFeatured(1, "")}
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {/* className="btn-primary" */}
          <button type="submit" >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
