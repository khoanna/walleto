"use client";

import React, { useState, useEffect, useRef } from "react";

// Hooks & Services
import useEvaluate from "@/services/useEvaluate";
import useDashboard from "@/services/useDashboard";
import useTransaction from "@/services/useTransaction";
import usePost from "@/services/usePost";
import useImgae from "@/services/useImage";
import useFriendship from "@/services/useFriendship";
import { useUserContext } from "@/context";

// Types
import {
  TransactionOfPost,
  InvestmentAssetOfPost,
  Post,
  FriendshipData,
  UserInfo,
  ShareType,
  DateFilter,
  ApiResponse,
  EvaluateResponse,
} from "@/type/Social";
import { Transaction, Asset } from "@/type/Dashboard";

// UI Components
import { PostForm, PostItem } from "@/components/social/SocialFeed";
import {
  UserSearchBox,
  FriendRequestList,
  FriendList,
} from "@/components/social/SocialSidebar";
import {
  AssetSelectionModal,
  EditPostModal,
  DeleteFriendModal,
  ChatPopup,
} from "@/components/social/SocialModals";

import { Newspaper, Users, Loader2 } from "lucide-react";

export default function SocialPage() {
  const context = useUserContext();
  const user = context?.user;
  const permissions = context?.permissions;
  const hasPostPermission = permissions?.includes("SOCIAL_NETWORK") ?? false;

  const { getListTransaction } = useTransaction();
  const {
    createTransactionPost,
    postLoading,
    isFetching,
    getListPostApproved,
    getListPostByUser,
    createAssetPost,
    deletePost,
    updatePost,
    updateTransactionPost,
    updateAssetPost,
    CreateFavouritePost,
    DeleteFavouritePost,
  } = usePost();
  const { getInvesmentAsset } = useDashboard();
  const { uploadImage } = useImgae();
  const { createEvaluate, updateEvaluate, deleteEvaluate } = useEvaluate();
  const {
    getUserList,
    getFriendshipReceiveOfUser,
    getFriendshipOfUser,
    getFriendshipSentOfUser,
    acceptFrienship,
    rejectFrienship,
    createFrienship,
    deleteFrienship,
  } = useFriendship();

  // --- STATE ---
  // State quản lý Tab trên Mobile (Mặc định là Feed)
  const [mobileTab, setMobileTab] = useState<"feed" | "friends">("feed");

  const [postContent, setPostContent] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareType, setShareType] = useState<ShareType>("none");

  const [rawTransactionList, setRawTransactionList] = useState<Transaction[]>(
    []
  );
  const [shareChartData, setShareChartData] = useState<
    TransactionOfPost[] | null
  >(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    from: "",
    to: "",
  });

  const [shareAssetData, setShareAssetData] = useState<
    InvestmentAssetOfPost[] | null
  >(null);
  const [pendingAssets, setPendingAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
    new Set()
  );
  const [isSelectingAssets, setIsSelectingAssets] = useState(false);

  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showCommentBox, setShowCommentBox] = useState<string | null>(null);
  const [starRating, setStarRating] = useState<Record<string, number>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});

  const [posts, setPosts] = useState<Post[]>([]);
  const [showUserPostsOnly, setShowUserPostsOnly] = useState(false);
  const [currentChat, setCurrentChat] = useState<{
    user: UserInfo;
    idFriendship: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendshipData[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendshipData[]>([]);
  const [myFriends, setMyFriends] = useState<FriendshipData[]>([]);
  const [friendshipLoading, setFriendshipLoading] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState<{
    idFriendship: string;
    name: string;
  } | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  // --- LOGIC FUNCTIONS (Hoisted & Typed) ---
  const fetchPosts = async () => {
    if (user?.idUser) {
      const r = showUserPostsOnly
        ? ((await getListPostByUser(user.idUser)) as ApiResponse<Post[]>)
        : ((await getListPostApproved(user.idUser)) as ApiResponse<Post[]>);

      if (r?.success) setPosts(r.data);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.idUser, showUserPostsOnly]);

  useEffect(() => {
    fetchFriendData();
  }, [user?.idUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      )
        setShowSearchResults(false);
      if (
        activeMenuPostId &&
        !(event.target as HTMLElement).closest(".post-menu-trigger")
      )
        setActiveMenuPostId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuPostId]);

  const getFriendInfo = (f: FriendshipData) =>
    !f.infFriendshipResponse.receiver
      ? f.infFriendshipResponse.sender
      : user?.idUser && f.infFriendshipResponse.sender.idUser === user.idUser
      ? f.infFriendshipResponse.receiver
      : f.infFriendshipResponse.sender;

  const fetchFriendData = async () => {
    if (!user?.idUser) return;
    try {
      setFriendshipLoading(true);
      const reqRes = (await getFriendshipReceiveOfUser(
        user.idUser
      )) as ApiResponse<FriendshipData[]>;
      if (reqRes?.success) setFriendRequests(reqRes.data);

      const friendRes = (await getFriendshipOfUser(user.idUser)) as ApiResponse<
        FriendshipData[]
      >;
      if (friendRes?.success) setMyFriends(friendRes.data);

      const sentRes = (await getFriendshipSentOfUser(
        user.idUser
      )) as ApiResponse<FriendshipData[]>;
      if (sentRes?.success) setSentRequests(sentRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFriendshipLoading(false);
    }
  };

  const checkIsFriend = (targetId: string) =>
    myFriends.some((f) => getFriendInfo(f)?.idUser === targetId);
  const checkIsPendingRequest = (targetId: string) =>
    friendRequests.some(
      (req) => req.infFriendshipResponse.sender.idUser === targetId
    );
  const checkIsSentRequest = (targetId: string) =>
    sentRequests.some(
      (req) => req.infFriendshipResponse.receiver?.idUser === targetId
    );

  const handleSearchFocus = async () => {
    setShowSearchResults(true);
    if (allUsers.length === 0) {
      const res = (await getUserList()) as ApiResponse<UserInfo[]>;
      if (res?.success) {
        const list = res.data.filter((u) => u.idUser !== user?.idUser);
        setAllUsers(list);
        setFilteredUsers(list);
      }
    } else handleSearchChange(searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) setFilteredUsers(allUsers);
    else
      setFilteredUsers(
        allUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(query.toLowerCase()))
        )
      );
  };

  const handleSendFriendRequest = async (targetId: string) => {
    if (!user?.idUser) return;
    const res = (await createFrienship({
      idUser: user.idUser,
      idRef: targetId,
    })) as ApiResponse<FriendshipData>;
    if (res?.success) {
      alert("Đã gửi lời mời!");
      fetchFriendData();
    }
  };

  const handleAcceptRequest = async (sid: string) => {
    const req = friendRequests.find(
      (r) => r.infFriendshipResponse.sender.idUser === sid
    );
    if (!req) return;
    const res = (await acceptFrienship(req.idFriendship, {
      status: "Chấp Nhận",
    })) as ApiResponse<FriendshipData>;
    if (res?.success) fetchFriendData();
  };

  const handleRejectRequest = async (sid: string) => {
    const req = friendRequests.find(
      (r) => r.infFriendshipResponse.sender.idUser === sid
    );
    if (!req) return;
    const res = (await rejectFrienship(req.idFriendship, {
      status: "Từ Chối",
    })) as ApiResponse<FriendshipData>;
    if (res?.success)
      setFriendRequests((p) =>
        p.filter((r) => r.infFriendshipResponse.sender.idUser !== sid)
      );
  };

  const confirmDeleteFriend = async () => {
    if (!friendToDelete) return;
    const res = (await deleteFrienship(
      friendToDelete.idFriendship
    )) as ApiResponse<FriendshipData>;
    if (res?.success) {
      setMyFriends((p) =>
        p.filter((f) => f.idFriendship !== friendToDelete.idFriendship)
      );
      await fetchFriendData();
      if (currentChat?.user?.name === friendToDelete.name) setCurrentChat(null);
      setFriendToDelete(null);
    } else alert("Xóa thất bại!");
  };

  const loadRawTransactions = async () => {
    if (!user?.idUser) return [];
    const res = (await getListTransaction(user.idUser)) as ApiResponse<{
      expenseList: Transaction[];
    }>;
    setRawTransactionList(res?.data?.expenseList || []);
    return res?.data?.expenseList || [];
  };

  const loadRawAssets = async () => {
    if (!user?.idUser) return [];
    const res = (await getInvesmentAsset(user.idUser)) as ApiResponse<Asset[]>;
    setPendingAssets(res.data || []);
    return res.data || [];
  };

  const handleShareCashflow = async () => {
    if (!user?.idUser) return alert("Chưa đăng nhập!");
    const list = await loadRawTransactions();
    if (!list.length) return alert("Không có dữ liệu!");
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const to = now.toISOString().split("T")[0];
    setDateFilter({ from, to });
    filterAndSetTransactions(list, from, to);
    setShareType("cashflow");
    setShareAssetData(null);
  };

  const filterAndSetTransactions = (
    list: Transaction[],
    from: string,
    to: string
  ) => {
    const fT = new Date(from).getTime();
    const tT = new Date(to).getTime() + 86400000;
    const filtered = list.filter((i) => {
      const d = new Date(i.createAt).getTime();
      return d >= fT && d < tT;
    });

    const formatted: TransactionOfPost[] = filtered.map((i) => ({
      transactionName: i.transactionName,
      transactionType: (i.transactionType === "Chi" ? "Chi" : "Thu") as
        | "Chi"
        | "Thu",
      amount: i.amount,
      transactionDate: i.transactionDate,
    }));
    setShareChartData(formatted);
  };

  useEffect(() => {
    if (
      shareType === "cashflow" &&
      rawTransactionList.length &&
      dateFilter.from &&
      dateFilter.to
    )
      filterAndSetTransactions(
        rawTransactionList,
        dateFilter.from,
        dateFilter.to
      );
  }, [dateFilter.from, dateFilter.to]);

  const handleSharePortfolio = async () => {
    if (!user?.idUser) return alert("Chưa đăng nhập!");
    const list = await loadRawAssets();
    if (!list.length) {
      alert("Chưa có danh mục!");
      return;
    }
    setPendingAssets(list);
    setSelectedAssetIds(new Set());
    setIsSelectingAssets(true);
    setShareType("portfolio");
    setShareChartData(null);
  };

  const confirmAssetSelection = () => {
    if (!selectedAssetIds.size) return alert("Chọn ít nhất 1!");
    const selected = pendingAssets.filter((i) =>
      selectedAssetIds.has(i.idAsset)
    );
    const formatted: InvestmentAssetOfPost[] = selected.map((i: Asset) => ({
      assetName: i.assetName,
      assetSymbol: i.assetSymbol.toUpperCase(),
      currentPrice: i.currentPrice,
      marketCap: i.marketCap,
      totalVolume: i.totalVolume,
      priceChangePercentage24h: i.priceChangePercentage24h,
      url: i.url,
    }));
    setShareAssetData(formatted);
    setIsSelectingAssets(false);
  };

  const resetPostForm = () => {
    setPostContent("");
    setSelectedFile(null);
    setSelectedImage(null);
    setShareChartData(null);
    setShareAssetData(null);
    setShareType("none");
    fetchPosts();
  };

  const handleSubmitPost = async () => {
    if (!user?.idUser) return alert("Chưa đăng nhập!");
    if (
      !postContent.trim() &&
      !selectedFile &&
      !shareChartData &&
      !shareAssetData
    )
      return alert("Nội dung trống!");
    const url = selectedFile ? await uploadImage(selectedFile) : "";
    let res: ApiResponse<Post> | undefined;

    if (shareAssetData?.length)
      res = (await createAssetPost({
        title: postContent || "Danh mục",
        content: postContent || "",
        urlImage: url,
        idUser: user.idUser,
        investmentAssetOfPost: shareAssetData,
      })) as ApiResponse<Post>;
    else if (shareChartData?.length)
      res = (await createTransactionPost({
        title: postContent || "Dòng tiền",
        content: postContent || "",
        urlImage: url,
        idUser: user.idUser,
        transactionOfPost: shareChartData,
      })) as ApiResponse<Post>;
    else
      res = (await createTransactionPost({
        title: postContent.substring(0, 50) || "Bài mới",
        content: postContent,
        urlImage: url,
        idUser: user.idUser,
        transactionOfPost: [],
      })) as ApiResponse<Post>;

    if (res?.success) {
      alert("Thành công!");
      resetPostForm();
    } else alert(res?.message || "Lỗi!");
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Xóa?")) return;
    const res = (await deletePost(id)) as ApiResponse<boolean>;
    if (res?.success) {
      alert("Đã xóa");
      fetchPosts();
    } else alert("Lỗi!");
  };

  const handleEditPost = async (post: Post) => {
    setSelectedFile(null);
    setSelectedAssetIds(new Set());

    setPostContent(post.content || post.title || "");
    setSelectedImage(post.urlImage || null);
    setEditingPost(post);
    setActiveMenuPostId(null);

    const snap = post.snapshotResponse?.[0];
    if (snap?.transactionOfPosts?.length) {
      setShareType("cashflow");
      setShareChartData(snap.transactionOfPosts);
      setShareAssetData(null);
      await loadRawTransactions();
      const now = new Date().toISOString().split("T")[0];
      setDateFilter({ from: now, to: now });
    } else if (snap?.investmentAssetOfPosts?.length) {
      setShareType("portfolio");
      setShareAssetData(snap.investmentAssetOfPosts);
      setShareChartData(null);
      const assets = await loadRawAssets();
      const ids = new Set<string>();
      const symbols = new Set(
        snap.investmentAssetOfPosts.map((a) => a.assetSymbol.toUpperCase())
      );
      assets.forEach((a: Asset) => {
        if (symbols.has(a.assetSymbol.toUpperCase())) ids.add(a.idAsset);
      });
      setSelectedAssetIds(ids);
    } else {
      setShareType("none");
      setShareChartData(null);
      setShareAssetData(null);
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!editingPost || !user?.idUser) return;

    let finalContent = postContent.trim();
    if (!finalContent) {
      finalContent = (editingPost.content || editingPost.title || "").trim();
    }
    if (!finalContent) {
      return alert("Nội dung không được để trống!");
    }

    const finalTitle = editingPost.title?.trim() || finalContent;

    const url = selectedFile
      ? await uploadImage(selectedFile)
      : selectedImage || editingPost.urlImage || "";

    let res;

    if (shareType === "cashflow" && shareChartData) {
      res = await updateTransactionPost(editingPost.idPost, {
        title: finalTitle,
        content: finalContent,
        urlImage: url,
        transactionOfPost: shareChartData,
      });
    } else if (shareType === "portfolio" && shareAssetData) {
      res = await updateAssetPost(editingPost.idPost, {
        title: finalTitle,
        content: finalContent,
        urlImage: url,
        investmentAssetOfPost: shareAssetData,
      });
    } else {
      res = await updatePost(editingPost.idPost, {
        title: finalTitle,
        content: finalContent,
        urlImage: url,
      });
    }

    if (res?.success) {
      alert("Cập nhật thành công!");
      setIsEditModalOpen(false);
      setEditingPost(null);
      resetPostForm();
    } else {
      alert(res?.message || "Cập nhật thất bại!");
    }
  };
  const handleEvaluate = async (postId: string) => {
    if (!user?.idUser) return alert("Chưa đăng nhập!");
    const res = (await createEvaluate({
      star: starRating[postId] || 5,
      comment: commentText[postId] || "",
      idUser: user.idUser,
      idPost: postId,
    })) as ApiResponse<EvaluateResponse>;

    if (res?.success && res.data) {
      alert("Đã gửi đánh giá!");
      const newComment = res.data;

      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.idPost === postId) {
            const updatedEvaluations = [
              newComment,
              ...p.evaluateResponse.evaluateResponses,
            ];
            const newTotal = p.evaluateResponse.totalComments + 1;
            const newAverage =
              updatedEvaluations.reduce((acc, curr) => acc + curr.star, 0) /
              newTotal;

            return {
              ...p,
              evaluateResponse: {
                ...p.evaluateResponse,
                evaluateResponses: updatedEvaluations,
                totalComments: newTotal,
                averageStars: newAverage,
              },
            };
          }
          return p;
        })
      );

      setCommentText((p) => ({ ...p, [postId]: "" }));
      setShowCommentBox(null);
    } else {
      alert("Lỗi khi gửi đánh giá!");
    }
  };

  const handleUpdateComment = async (
    postId: string,
    idEvaluate: string,
    body: { comment?: string; star?: number }
  ) => {
    if (!user?.idUser) return alert("Chưa đăng nhập!");
    try {
      const res = (await updateEvaluate(
        idEvaluate,
        body
      )) as ApiResponse<EvaluateResponse>;
      if (res?.success && res.data) {
        const updatedComment = res.data;
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.idPost === postId) {
              const updatedEvaluations =
                p.evaluateResponse.evaluateResponses.map((e) =>
                  e.idEvaluate === idEvaluate ? updatedComment : e
                );
              const newAverage =
                p.evaluateResponse.totalComments > 0
                  ? updatedEvaluations.reduce(
                      (acc, curr) => acc + curr.star,
                      0
                    ) / p.evaluateResponse.totalComments
                  : 0;

              return {
                ...p,
                evaluateResponse: {
                  ...p.evaluateResponse,
                  evaluateResponses: updatedEvaluations,
                  averageStars: newAverage,
                },
              };
            }
            return p;
          })
        );
      } else {
        alert("Lỗi khi cập nhật bình luận!");
      }
    } catch (error) {
      console.error("Error updating evaluate:", error);
      alert("Lỗi khi cập nhật bình luận!");
    }
  };

  const handleToggleFavorite = async (
    postId: string,
    isFavorited: boolean
  ): Promise<void> => {
    if (!user?.idUser) return alert("Chưa đăng nhập!");
    try {
      const res = isFavorited
        ? await DeleteFavouritePost({ idPost: postId, idUser: user.idUser })
        : await CreateFavouritePost({ idPost: postId, idUser: user.idUser });

      if (res?.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.idPost === postId) {
              return { ...p, isFavorited: !isFavorited };
            }
            return p;
          })
        );
      } else {
        throw new Error("API call failed");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Lỗi khi cập nhật thích bài viết!");
    }
  };

  const handleDeleteComment = async (
    postId: string,
    idEvaluate: string
  ): Promise<void> => {
    if (!confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;
    try {
      const res = await deleteEvaluate(idEvaluate);
      if (res?.success) {
        alert("Đã xóa bình luận!");
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.idPost === postId) {
              const updatedEvaluations =
                p.evaluateResponse.evaluateResponses.filter(
                  (e) => e.idEvaluate !== idEvaluate
                );
              const newTotal = p.evaluateResponse.totalComments - 1;
              const newAverage =
                newTotal > 0
                  ? updatedEvaluations.reduce(
                      (acc, curr) => acc + curr.star,
                      0
                    ) / newTotal
                  : 0;

              return {
                ...p,
                evaluateResponse: {
                  ...p.evaluateResponse,
                  evaluateResponses: updatedEvaluations,
                  totalComments: newTotal,
                  averageStars: newAverage,
                },
              };
            }
            return p;
          })
        );
      } else {
        alert("Lỗi khi xóa bình luận!");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Lỗi khi xóa bình luận!");
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* TAB SWITCHER - MOBILE ONLY */}
      <div className="lg:hidden mb-6">
        <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-inner">
          <button
            onClick={() => setMobileTab("feed")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mobileTab === "feed"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Newspaper size={16} /> Bảng tin
          </button>
          <button
            onClick={() => setMobileTab("friends")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mobileTab === "friends"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Users size={16} /> Bạn bè & Tìm kiếm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COL: FEED */}
        <div
          className={`lg:col-span-8 space-y-6 ${
            mobileTab === "feed" ? "block" : "hidden lg:block"
          }`}
        >
          {hasPostPermission && (
            <div className="bg-background/70 rounded-xl p-4 space-y-4 relative shadow-md">
              <h3 className="text-sm font-bold text-gray-500">TẠO BÀI VIẾT</h3>
              <PostForm
                content={postContent}
                setContent={setPostContent}
                selectedImage={selectedImage}
                onImageUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSelectedFile(f);
                    setSelectedImage(URL.createObjectURL(f));
                  }
                }}
                onRemoveImage={() => {
                  setSelectedImage(null);
                  setSelectedFile(null);
                }}
                shareType={shareType}
                setShareType={setShareType}
                chartData={shareChartData}
                setChartData={setShareChartData}
                assetData={shareAssetData}
                setAssetData={setShareAssetData}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                onShareCashflow={handleShareCashflow}
                onSharePortfolio={handleSharePortfolio}
                onSelectAssets={() => setIsSelectingAssets(true)}
                onSubmit={handleSubmitPost}
                isLoading={postLoading}
                isEditMode={false}
              />
            </div>
          )}
          <div className="flex gap-2 items-center mb-4">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <button
              onClick={() => setShowUserPostsOnly(false)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                !showUserPostsOnly
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
              }`}
            >
              Tất cả bài viết
            </button>
            <button
              onClick={() => setShowUserPostsOnly(true)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                showUserPostsOnly
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
              }`}
            >
              Bài viết của tôi
            </button>
          </div>
          <div className="space-y-6">
            {isFetching ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              posts.map((post) => (
                <PostItem
                  key={post.idPost}
                  post={post}
                  currentUserId={user?.idUser}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  activeMenuId={activeMenuPostId}
                  toggleMenu={setActiveMenuPostId}
                  showCommentBox={showCommentBox === post.idPost}
                  toggleCommentBox={() =>
                    setShowCommentBox(
                      showCommentBox === post.idPost ? null : post.idPost
                    )
                  }
                  starRating={starRating[post.idPost] || 5}
                  setStarRating={(v: number) =>
                    setStarRating({ ...starRating, [post.idPost]: v })
                  }
                  commentText={commentText[post.idPost] || ""}
                  setCommentText={(v: string) =>
                    setCommentText({ ...commentText, [post.idPost]: v })
                  }
                  onSubmitComment={() => handleEvaluate(post.idPost)}
                  isExpanded={!!expandedComments[post.idPost]}
                  toggleExpanded={() =>
                    setExpandedComments({
                      ...expandedComments,
                      [post.idPost]: !expandedComments[post.idPost],
                    })
                  }
                  onToggleFavorite={handleToggleFavorite}
                  onDeleteComment={handleDeleteComment}
                  onUpdateComment={handleUpdateComment}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT COL: SIDEBAR (FRIENDS) */}
        <div
          className={`lg:col-span-4 space-y-4 ${
            mobileTab === "friends" ? "block" : "hidden lg:block"
          }`}
        >
          <UserSearchBox
            query={searchQuery}
            setQuery={setSearchQuery}
            onFocus={handleSearchFocus}
            results={filteredUsers}
            showResults={showSearchResults}
            searchRef={searchRef}
            onSendRequest={handleSendFriendRequest}
            checkIsFriend={checkIsFriend}
            checkIsPending={checkIsPendingRequest}
            checkIsSent={checkIsSentRequest}
          />
          <FriendRequestList
            requests={friendRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            isLoading={friendshipLoading}
          />
          <FriendList
            friends={myFriends}
            getFriendInfo={getFriendInfo}
            onChat={(u, idFriendship) =>
              setCurrentChat({ user: u, idFriendship })
            }
            onDelete={(id: string, name: string) =>
              setFriendToDelete({ idFriendship: id, name })
            }
            isLoading={friendshipLoading}
          />
        </div>

        {/* MODALS */}
        {isSelectingAssets && (
          <AssetSelectionModal
            assets={pendingAssets}
            selectedIds={selectedAssetIds}
            onToggle={(id: string) => {
              const newSet = new Set(selectedAssetIds);
              if (newSet.has(id)) newSet.delete(id);
              else newSet.add(id);
              setSelectedAssetIds(newSet);
            }}
            onConfirm={confirmAssetSelection}
            onClose={() => {
              setIsSelectingAssets(false);
            }}
            onCancel={() => {
              setIsSelectingAssets(false);
              setShareAssetData(null);
              setShareType("none");
              setSelectedAssetIds(new Set());
            }}
          />
        )}
        {isEditModalOpen && editingPost && (
          <EditPostModal
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingPost(null);
              resetPostForm();
            }}
          >
            <PostForm
              content={postContent}
              setContent={setPostContent}
              selectedImage={selectedImage}
              onImageUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) {
                  setSelectedFile(f);
                  setSelectedImage(URL.createObjectURL(f));
                }
              }}
              onRemoveImage={() => {
                setSelectedImage(null);
                setSelectedFile(null);
              }}
              shareType={shareType}
              setShareType={setShareType}
              chartData={shareChartData}
              setChartData={setShareChartData}
              assetData={shareAssetData}
              setAssetData={setShareAssetData}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onShareCashflow={handleShareCashflow}
              onSharePortfolio={handleSharePortfolio}
              onSelectAssets={() => setIsSelectingAssets(true)}
              onSubmit={handleUpdateSubmit}
              isLoading={postLoading}
              isEditMode={true}
            />
          </EditPostModal>
        )}
        {friendToDelete && (
          <DeleteFriendModal
            name={friendToDelete.name}
            onCancel={() => setFriendToDelete(null)}
            onConfirm={confirmDeleteFriend}
          />
        )}
        {currentChat && (
          <ChatPopup
            user={currentChat.user}
            idFriendship={currentChat.idFriendship}
            onClose={() => setCurrentChat(null)}
          />
        )}
      </div>
    </div>
  );
}
