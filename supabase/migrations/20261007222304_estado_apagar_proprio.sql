create policy "apagar o próprio estado" on public.estado_app for delete to authenticated using ((select auth.uid()) = usuario_id);
