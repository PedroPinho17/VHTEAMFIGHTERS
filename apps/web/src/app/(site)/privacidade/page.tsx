import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidade — VH Team Fighters",
  description: "Informação sobre o tratamento de dados pessoais no site VH Team Fighters.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="mb-6 text-sm text-cream/50">
        <Link href="/" className="underline hover:text-accent">
          Voltar ao início
        </Link>
      </p>

      <h1 className="font-display text-4xl text-cream md:text-5xl">Política de privacidade</h1>
      <p className="mt-3 text-sm text-cream/50">Última atualização: outubro de 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/75">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">1. Responsável pelo tratamento</h2>
          <p>
            VH Team Fighters (Lobão) é responsável pelo tratamento dos dados pessoais recolhidos
            através deste site, em especial pelo formulário de inscrição / contacto.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">2. Dados tratados</h2>
          <p>
            Nome, email, telefone (opcional) e mensagem (opcional), bem como metadados técnicos
            necessários à segurança (ex.: endereço IP para limitação de pedidos abusivos).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">3. Finalidade e base legal</h2>
          <p>
            Os dados são tratados para responder ao pedido de inscrição ou contacto, com base no
            consentimento prestado no formulário (RGPD art. 6.º, n.º 1, alínea a)).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">4. Conservação</h2>
          <p>
            As inscrições são conservadas enquanto forem necessárias para o contacto e gestão
            interna, tipicamente até 24 meses após o último tratamento, ou até pedido de
            apagamento. O administrador pode anonimizar / apagar um registo no backoffice (RGPD).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">5. Direitos</h2>
          <p>
            Pode solicitar acesso, retificação, apagamento ou limitação do tratamento contactando
            o email indicado na página de contactos, ou através do responsável do ginásio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">6. Destinatários</h2>
          <p>
            Os dados não são vendidos. Podem ser processados por prestadores técnicos (alojamento,
            email transacional, armazenamento de ficheiros) sob contrato e apenas para operar o
            site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-cream">7. Contacto</h2>
          <p>
            Questões sobre privacidade: use os contactos em{" "}
            <Link href="/contactos" className="underline hover:text-accent">
              /contactos
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
