import type { RubricType } from "@/generated/prisma/client";
import { entitlementService } from "@/application/billing/entitlement.service";
import { postAdminRepository } from "@/infrastructure/social/post-admin.repository";

export const postAdminService = {
  async createPost(input: {
    title: string;
    content: string;
    type: "text" | "media";
    rubric: RubricType;
    scheduledAt?: string;
    vipOnly?: boolean;
    authorId: string;
  }) {
    return postAdminRepository.createPost(input);
  },

  async listPosts(input: {
    rubric?: string | null;
    published: boolean;
    viewerUserId?: string;
    viewerRole?: string | null;
  }) {
    const vipStatus = await entitlementService.getUserVipStatus(
      input.viewerUserId,
    );

    return postAdminRepository.listPosts({
      published: input.published,
      rubric: input.rubric,
      viewerUserId: input.viewerUserId,
      viewerRole: input.viewerRole,
      viewerHasVip: vipStatus.isVipActive,
    });
  },

  async getPostMetaById(id: string) {
    return postAdminRepository.findPostMetaById(id);
  },

  async updatePost(
    id: string,
    data: {
      title?: string;
      content?: string;
      isPinned?: boolean;
    },
    rubric: RubricType,
  ) {
    return postAdminRepository.updatePost(id, data, rubric);
  },

  async deletePost(id: string) {
    await postAdminRepository.deletePost(id);
  },
};
